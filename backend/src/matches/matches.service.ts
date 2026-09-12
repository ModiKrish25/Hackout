import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { QueryMatchDto } from './dto/query-match.dto';
import { WasteListingsService } from '../waste-listings/waste-listings.service';
import { FacilitiesService } from '../facilities/facilities.service';
import { CarbonRecordsService } from '../carbon-records/carbon-records.service';
import { MatchStatus } from '../common/enums/match-status.enum';
import { WasteListingStatus } from '../common/enums/waste-listing-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

export interface CandidateFacilityResult {
    facilityId: number;
    facilityName: string;
    facilityType: string;
    operatorName: string;
    distanceKm: number;
    remainingCapacityTons: number;
    totalCapacityTons: number;
    score: number;
}

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        private readonly wasteListingsService: WasteListingsService,
        private readonly facilitiesService: FacilitiesService,
        private readonly carbonRecordsService: CarbonRecordsService,
    ) { }

    async findCandidates(listingId: number): Promise<CandidateFacilityResult[]> {
        const listing = await this.wasteListingsService.findOne(listingId);
        if (!listing) {
            throw new NotFoundException(`Listing with ID ${listingId} not found`);
        }

        const allFacilities = await this.facilitiesService.findAll({});

        // Step 1: Filter compatible facilities
        const compatible = allFacilities.filter((facility) => {
            const acceptsType = facility.acceptedWasteTypes?.includes(listing.wasteType);
            const remaining = Number(facility.capacityTonsPerWeek) - Number(facility.currentUtilization);
            const hasCapacity = remaining >= Number(listing.quantityTons);
            return acceptsType && hasCapacity;
        });

        if (compatible.length === 0) {
            return [];
        }

        // Step 2: Compute distances
        const facilitiesWithDistances = compatible.map((facility) => {
            const distanceKm = this.calculateHaversineDistance(
                Number(listing.locationLat),
                Number(listing.locationLng),
                Number(facility.locationLat),
                Number(facility.locationLng),
            );
            const remainingCapacity = Number(
                (Number(facility.capacityTonsPerWeek) - Number(facility.currentUtilization)).toFixed(2),
            );

            return {
                facility,
                distanceKm,
                remainingCapacity,
            };
        });

        // Step 3: Compute normalized scores
        const distances = facilitiesWithDistances.map((f) => f.distanceKm);
        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);

        const scoredCandidates: CandidateFacilityResult[] = facilitiesWithDistances.map((item) => {
            const score = this.calculateMatchScore(
                item.distanceKm,
                minDistance,
                maxDistance,
                item.remainingCapacity,
                Number(item.facility.capacityTonsPerWeek),
            );

            return {
                facilityId: item.facility.id,
                facilityName: `Facility #${item.facility.id} (${item.facility.facilityType})`,
                facilityType: item.facility.facilityType,
                operatorName: item.facility.operator?.name || 'Operator',
                distanceKm: item.distanceKm,
                remainingCapacityTons: item.remainingCapacity,
                totalCapacityTons: Number(item.facility.capacityTonsPerWeek),
                score,
            };
        });

        // Step 4: Sort descending by score and return top 5
        return scoredCandidates.sort((a, b) => b.score - a.score).slice(0, 5);
    }

    calculateMatchScore(
        distanceKm: number,
        minDistance: number,
        maxDistance: number,
        remainingCapacity: number,
        totalCapacity: number,
    ): number {
        const wasteTypeCompatibility = 1.0; // 1.0 because pre-filtered for compatibility

        // Normalized distance component (0.0 to 1.0, closer is higher)
        let normalizedDistance: number;
        if (maxDistance > minDistance) {
            normalizedDistance = 1.0 - (distanceKm - minDistance) / (maxDistance - minDistance);
        } else {
            normalizedDistance = 1.0 / (1.0 + distanceKm / 25.0);
        }

        // Remaining capacity ratio component (0.0 to 1.0)
        const remainingCapacityRatio = totalCapacity > 0
            ? Math.min(1.0, Math.max(0.0, remainingCapacity / totalCapacity))
            : 0;

        // Weighted combination: 40% waste compatibility + 35% proximity + 25% capacity
        const totalScore = (
            (0.40 * wasteTypeCompatibility) +
            (0.35 * normalizedDistance) +
            (0.25 * remainingCapacityRatio)
        ) * 100;

        return Number(totalScore.toFixed(2));
    }

    calculateHaversineDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number((R * c).toFixed(2));
    }

    async create(createDto: CreateMatchDto): Promise<Match> {
        const listing = await this.wasteListingsService.findOne(createDto.listingId);
        if (listing.status !== WasteListingStatus.LISTED) {
            throw new BadRequestException(
                `Listing #${createDto.listingId} is currently '${listing.status}' and cannot be matched`,
            );
        }

        const facility = await this.facilitiesService.findOne(createDto.facilityId);
        const remainingCapacity = Number(facility.capacityTonsPerWeek) - Number(facility.currentUtilization);
        if (remainingCapacity < createDto.matchedQuantityTons) {
            throw new BadRequestException(
                `Facility #${createDto.facilityId} has insufficient remaining capacity (${remainingCapacity}T available, requested ${createDto.matchedQuantityTons}T)`,
            );
        }

        const match = this.matchRepository.create({
            listingId: createDto.listingId,
            facilityId: createDto.facilityId,
            matchedQuantityTons: createDto.matchedQuantityTons,
            matchScore: createDto.matchScore ?? null,
            status: MatchStatus.PENDING,
        });

        const savedMatch = await this.matchRepository.save(match);

        // Update listing status to MATCHED
        listing.status = WasteListingStatus.MATCHED;
        await this.wasteListingsService.updateStatus(
            listing.id,
            { status: WasteListingStatus.MATCHED },
            { id: listing.generatorId, role: UserRole.ADMIN } as User,
        );

        return this.findOne(savedMatch.id);
    }

    async confirm(id: number, user: User): Promise<Match> {
        const match = await this.findOne(id);
        if (match.status !== MatchStatus.PENDING) {
            throw new BadRequestException(`Match #${id} is already in status '${match.status}'`);
        }

        const isOperator = match.facility.operatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;
        if (!isOperator && !isAdmin) {
            throw new ForbiddenException('Only the facility operator can confirm this match');
        }

        // Increment facility current utilization
        const facility = match.facility;
        const newUtilization = Number(facility.currentUtilization) + Number(match.matchedQuantityTons);
        await this.facilitiesService.update(
            facility.id,
            { currentUtilization: newUtilization },
            user,
        );

        // Update match status to SCHEDULED
        match.status = MatchStatus.SCHEDULED;
        const updatedMatch = await this.matchRepository.save(match);

        // Update listing status to SCHEDULED
        await this.wasteListingsService.updateStatus(
            match.listingId,
            { status: WasteListingStatus.SCHEDULED },
            user,
        );

        return updatedMatch;
    }

    async process(id: number, user: User): Promise<{ match: Match; carbonRecord: any }> {
        const match = await this.findOne(id);
        if (match.status !== MatchStatus.SCHEDULED && match.status !== MatchStatus.COLLECTED) {
            throw new BadRequestException(
                `Match #${id} must be in 'scheduled' or 'collected' status to be processed (current: '${match.status}')`,
            );
        }

        const isOperator = match.facility.operatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;
        if (!isOperator && !isAdmin) {
            throw new ForbiddenException('Only the facility operator can process this match');
        }

        // Update match status to PROCESSED
        match.status = MatchStatus.PROCESSED;
        const updatedMatch = await this.matchRepository.save(match);

        // Update listing status to COLLECTED
        await this.wasteListingsService.updateStatus(
            match.listingId,
            { status: WasteListingStatus.COLLECTED },
            user,
        );

        // Auto-create CarbonRecord via hook
        const carbonRecord = await this.carbonRecordsService.createForMatch(updatedMatch);

        return {
            match: updatedMatch,
            carbonRecord,
        };
    }

    async reject(id: number, user: User): Promise<{ message: string }> {
        const match = await this.findOne(id);
        if (match.status !== MatchStatus.PENDING) {
            throw new BadRequestException(`Cannot reject match #${id} in '${match.status}' status`);
        }

        const isOperator = match.facility.operatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;
        if (!isOperator && !isAdmin) {
            throw new ForbiddenException('Only the facility operator or admin can reject this match');
        }

        // Revert listing status back to LISTED
        await this.wasteListingsService.updateStatus(
            match.listingId,
            { status: WasteListingStatus.LISTED },
            user,
        );

        // Remove the pending match
        await this.matchRepository.remove(match);

        return { message: 'Match rejected and waste listing reverted to listed status' };
    }

    async findAll(query: QueryMatchDto): Promise<Match[]> {
        const qb = this.matchRepository
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.listing', 'listing')
            .leftJoinAndSelect('listing.generator', 'generator')
            .leftJoinAndSelect('match.facility', 'facility')
            .leftJoinAndSelect('facility.operator', 'operator');

        if (query.facilityId) {
            qb.andWhere('match.facilityId = :facilityId', { facilityId: query.facilityId });
        }

        if (query.listingId) {
            qb.andWhere('match.listingId = :listingId', { listingId: query.listingId });
        }

        if (query.status) {
            qb.andWhere('match.status = :status', { status: query.status });
        }

        qb.orderBy('match.createdAt', 'DESC');
        return qb.getMany();
    }

    async findOne(id: number): Promise<Match> {
        const match = await this.matchRepository.findOne({
            where: { id },
            relations: ['listing', 'listing.generator', 'facility', 'facility.operator'],
        });

        if (!match) {
            throw new NotFoundException(`Match with ID ${id} not found`);
        }

        return match;
    }
}
