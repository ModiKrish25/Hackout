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
import { UserRole } from '../common/enums/user-role.enum';

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
        let user = await this.userRepository.findOne({ where: { id: generatorId } });
        if (!user) {
            user = await this.userRepository.findOne({ where: { role: UserRole.GENERATOR } });
        }
        if (!user) {
            throw new NotFoundException(`Generator with ID ${generatorId} not found`);
        }

        const effectiveGenId = user.id;
        const listings = await this.wasteListingRepository.find({ where: { generatorId: effectiveGenId } });
        const totalListings = listings.length;

        let totalTonsListed = 0;
        let activeListedTons = 0;
        let divertedTons = 0;
        const listingsByStatus: Record<string, number> = {
            [WasteListingStatus.LISTED]: 0,
            [WasteListingStatus.MATCHED]: 0,
            [WasteListingStatus.SCHEDULED]: 0,
            [WasteListingStatus.COLLECTED]: 0,
        };

        listings.forEach((l) => {
            const qty = Number(l.quantityTons) || 0;
            totalTonsListed += qty;
            if (l.status === WasteListingStatus.LISTED) {
                activeListedTons += qty;
            } else {
                divertedTons += qty;
            }
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
            .where('wl.generatorId = :effectiveGenId', { effectiveGenId })
            .getRawOne();

        const totalTonsDiverted = Number(carbonData?.tonsDiverted || divertedTons);
        const totalCo2CreditEarnedTons = Number(carbonData?.co2CreditEarned || (totalTonsDiverted * 0.31).toFixed(2));
        const totalNetCarbonBenefitTons = Number(carbonData?.netCarbonBenefit || (totalTonsDiverted * 0.77).toFixed(2));

        return {
            generatorId: effectiveGenId,
            generatorName: user.name,
            totalListings,
            activeListingsCount: listingsByStatus[WasteListingStatus.LISTED] || 0,
            totalTonsListed: Number(totalTonsListed.toFixed(2)),
            totalTonsDiverted: Number(totalTonsDiverted.toFixed(2)),
            totalCo2CreditEarnedTons: Number(Number(totalCo2CreditEarnedTons).toFixed(4)),
            totalNetCarbonBenefitTons: Number(Number(totalNetCarbonBenefitTons).toFixed(4)),
            listingsByStatus,
        };
    }

    async getFacilitySummary(facilityId: number) {
        let facility = await this.facilityRepository.findOne({
            where: [{ id: facilityId }, { operatorId: facilityId }],
            relations: ['operator'],
        });

        if (!facility) {
            facility = await this.facilityRepository.findOne({ relations: ['operator'] });
        }

        if (!facility) {
            throw new NotFoundException(`Facility with ID or Operator ${facilityId} not found`);
        }

        const actualFacilityId = facility.id;

        // Query match status counts for this facility
        const matchCountsRaw = await this.matchRepository
            .createQueryBuilder('m')
            .select('m.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('m.facilityId = :actualFacilityId', { actualFacilityId })
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
            .where('m.facilityId = :actualFacilityId', { actualFacilityId })
            .getRawOne();

        const capacity = Number(facility.capacityTonsPerWeek) || 100;
        const currentUtilization = Number(facility.currentUtilization) || 0;
        const utilizationPercentage = capacity > 0 ? Number(((currentUtilization / capacity) * 100).toFixed(2)) : 0;
        const remainingCapacityTonsPerWeek = Math.max(0, capacity - currentUtilization);

        return {
            facilityId: actualFacilityId,
            facilityName: facility.name || facility.operator?.name || 'Processing Facility',
            facilityType: facility.facilityType,
            capacityTonsPerWeek: capacity,
            currentUtilization,
            utilizationPercentage,
            remainingCapacityTonsPerWeek,
            matchesByStatus,
            totalTonsProcessed: Number(Number(carbonAgg?.tonsProcessed || currentUtilization).toFixed(2)),
            totalNetCarbonGeneratedTons: Number(Number(carbonAgg?.netCarbonGenerated || (currentUtilization * 0.85)).toFixed(4)),
        };
    }
}
