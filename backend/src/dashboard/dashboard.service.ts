import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteListing } from '../waste-listings/entities/waste-listing.entity';
import { Facility } from '../facilities/entities/facility.entity';
import { Match } from '../matches/entities/match.entity';
import { CarbonRecord } from '../carbon-records/entities/carbon-record.entity';
import { User } from '../users/entities/user.entity';
import { FacilitiesService } from '../facilities/facilities.service';
import { MatchStatus } from '../common/enums/match-status.enum';
import { WasteListingStatus } from '../common/enums/waste-listing-status.enum';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(WasteListing)
        private readonly wasteListingRepository: Repository<WasteListing>,
        @InjectRepository(Facility)
        private readonly facilityRepository: Repository<Facility>,
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        @InjectRepository(CarbonRecord)
        private readonly carbonRecordRepository: Repository<CarbonRecord>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly facilitiesService: FacilitiesService,
    ) { }

    async getMunicipalSummary() {
        const [totalListings, totalFacilities] = await Promise.all([
            this.wasteListingRepository.count(),
            this.facilityRepository.count(),
        ]);

        // Aggregate Carbon Records totals
        const carbonAgg = await this.carbonRecordRepository
            .createQueryBuilder('cr')
            .select('SUM(cr.quantityTons)', 'totalTonsProcessed')
            .addSelect('SUM(cr.co2SequesteredTons)', 'totalCo2SequesteredTons')
            .addSelect('SUM(cr.netCarbonBenefitTons)', 'totalNetCarbonBenefitTons')
            .getRawOne();

        // Aggregate Matches by Status
        const matchCountsRaw = await this.matchRepository
            .createQueryBuilder('m')
            .select('m.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('m.status')
            .getRawMany();

        const matchesByStatus = {
            pending: 0,
            scheduled: 0,
            collected: 0,
            processed: 0,
        };

        matchCountsRaw.forEach((row) => {
            if (row.status in matchesByStatus) {
                matchesByStatus[row.status as MatchStatus] = Number(row.count);
            }
        });

        return {
            totalListings,
            totalFacilities,
            totalTonsProcessed: Number(Number(carbonAgg?.totalTonsProcessed || 0).toFixed(2)),
            totalCo2SequesteredTons: Number(Number(carbonAgg?.totalCo2SequesteredTons || 0).toFixed(4)),
            totalNetCarbonBenefitTons: Number(Number(carbonAgg?.totalNetCarbonBenefitTons || 0).toFixed(4)),
            matchesByStatus,
        };
    }

    async getMunicipalMapData() {
        const [listingsRaw, facilitiesRaw] = await Promise.all([
            this.wasteListingRepository.find({ relations: ['generator'] }),
            this.facilityRepository.find({ relations: ['operator'] }),
        ]);

        const listings = listingsRaw.map((l) => ({
            id: l.id,
            generatorId: l.generatorId,
            generatorName: l.generator?.name || 'Generator',
            wasteType: l.wasteType,
            quantityTons: Number(l.quantityTons),
            moistureContent: l.moistureContent ? Number(l.moistureContent) : null,
            locationLat: Number(l.locationLat),
            locationLng: Number(l.locationLng),
            status: l.status,
            availableFrom: l.availableFrom,
            availableTo: l.availableTo,
        }));

        const facilities = facilitiesRaw.map((f) => {
            const capacity = Number(f.capacityTonsPerWeek);
            const utilization = Number(f.currentUtilization);
            const utilizationPercentage =
                capacity > 0 ? Number(((utilization / capacity) * 100).toFixed(2)) : 0;

            return {
                id: f.id,
                operatorId: f.operatorId,
                operatorName: f.operator?.name || 'Operator',
                facilityType: f.facilityType,
                acceptedWasteTypes: f.acceptedWasteTypes,
                capacityTonsPerWeek: capacity,
                currentUtilization: utilization,
                utilizationPercentage,
                locationLat: Number(f.locationLat),
                locationLng: Number(f.locationLng),
            };
        });

        return {
            listings,
            facilities,
        };
    }

    async getGeneratorSummary(generatorId: number) {
        const user = await this.userRepository.findOne({ where: { id: generatorId } });
        if (!user) {
            throw new NotFoundException(`Generator with ID ${generatorId} not found`);
        }

        const listings = await this.wasteListingRepository.find({ where: { generatorId } });
        const totalListings = listings.length;

        let totalTonsListed = 0;
        const listingsByStatus: Record<string, number> = {
            [WasteListingStatus.LISTED]: 0,
            [WasteListingStatus.MATCHED]: 0,
            [WasteListingStatus.SCHEDULED]: 0,
            [WasteListingStatus.COLLECTED]: 0,
        };

        listings.forEach((l) => {
            totalTonsListed += Number(l.quantityTons);
            if (l.status in listingsByStatus) {
                listingsByStatus[l.status]++;
            }
        });

        // Query Carbon Benefits tied to this generator's listings
        const carbonData = await this.carbonRecordRepository
            .createQueryBuilder('cr')
            .innerJoin('cr.match', 'm')
            .innerJoin('m.listing', 'wl')
            .select('SUM(cr.quantityTons)', 'tonsDiverted')
            .addSelect('SUM(cr.co2SequesteredTons)', 'co2CreditEarned')
            .addSelect('SUM(cr.netCarbonBenefitTons)', 'netCarbonBenefit')
            .where('wl.generatorId = :generatorId', { generatorId })
            .getRawOne();

        return {
            generatorId,
            generatorName: user.name,
            totalListings,
            totalTonsListed: Number(totalTonsListed.toFixed(2)),
            totalTonsDiverted: Number(Number(carbonData?.tonsDiverted || 0).toFixed(2)),
            totalCo2CreditEarnedTons: Number(Number(carbonData?.co2CreditEarned || 0).toFixed(4)),
            totalNetCarbonBenefitTons: Number(Number(carbonData?.netCarbonBenefit || 0).toFixed(4)),
            listingsByStatus,
        };
    }

    async getFacilitySummary(facilityId: number) {
        const facility = await this.facilitiesService.findOneWithDetails(facilityId);

        // Query match status counts for this facility
        const matchCountsRaw = await this.matchRepository
            .createQueryBuilder('m')
            .select('m.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('m.facilityId = :facilityId', { facilityId })
            .groupBy('m.status')
            .getRawMany();

        const matchesByStatus: Record<string, number> = {
            [MatchStatus.PENDING]: 0,
            [MatchStatus.SCHEDULED]: 0,
            [MatchStatus.COLLECTED]: 0,
            [MatchStatus.PROCESSED]: 0,
        };

        matchCountsRaw.forEach((row) => {
            if (row.status in matchesByStatus) {
                matchesByStatus[row.status] = Number(row.count);
            }
        });

        // Query processed carbon metrics for this facility
        const carbonAgg = await this.carbonRecordRepository
            .createQueryBuilder('cr')
            .innerJoin('cr.match', 'm')
            .select('SUM(cr.quantityTons)', 'tonsProcessed')
            .addSelect('SUM(cr.netCarbonBenefitTons)', 'netCarbonGenerated')
            .where('m.facilityId = :facilityId', { facilityId })
            .getRawOne();

        return {
            facilityId,
            facilityType: facility.facilityType,
            capacityTonsPerWeek: Number(facility.capacityTonsPerWeek),
            currentUtilization: Number(facility.currentUtilization),
            utilizationPercentage: facility.utilizationPercentage,
            remainingCapacityTonsPerWeek: facility.remainingCapacityTonsPerWeek,
            matchesByStatus,
            totalTonsProcessed: Number(Number(carbonAgg?.tonsProcessed || 0).toFixed(2)),
            totalNetCarbonGeneratedTons: Number(Number(carbonAgg?.netCarbonGenerated || 0).toFixed(4)),
        };
    }
}
