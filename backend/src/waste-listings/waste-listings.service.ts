import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteListing } from './entities/waste-listing.entity';
import { CreateWasteListingDto } from './dto/create-waste-listing.dto';
import { UpdateWasteListingStatusDto } from './dto/update-waste-listing-status.dto';
import { QueryWasteListingDto } from './dto/query-waste-listing.dto';
import { WasteListingStatus } from '../common/enums/waste-listing-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WasteListingsService {
    constructor(
        @InjectRepository(WasteListing)
        private readonly wasteListingRepository: Repository<WasteListing>,
    ) { }

    async create(generatorId: number, createDto: CreateWasteListingDto): Promise<WasteListing> {
        const fromDate = new Date(createDto.availableFrom);
        const toDate = new Date(createDto.availableTo);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new BadRequestException('Invalid date format for availableFrom or availableTo');
        }

        if (fromDate >= toDate) {
            throw new BadRequestException('availableFrom must be earlier than availableTo');
        }

        const listing = this.wasteListingRepository.create({
            ...createDto,
            generatorId,
            availableFrom: fromDate,
            availableTo: toDate,
            status: WasteListingStatus.LISTED,
        });

        return this.wasteListingRepository.save(listing);
    }

    async findAll(query: QueryWasteListingDto): Promise<WasteListing[]> {
        const qb = this.wasteListingRepository
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.generator', 'generator');

        if (query.wasteType) {
            qb.andWhere('listing.wasteType = :wasteType', { wasteType: query.wasteType });
        }

        if (query.status) {
            qb.andWhere('listing.status = :status', { status: query.status });
        }

        if (
            query.nearLat !== undefined &&
            query.nearLng !== undefined &&
            query.radiusKm !== undefined
        ) {
            // Haversine formula calculation in kilometers
            const haversineFormula = `(6371 * ACOS(
                LEAST(1.0, GREATEST(-1.0, 
                    COS(RADIANS(:nearLat)) * COS(RADIANS(listing.locationLat)) * 
                    COS(RADIANS(listing.locationLng) - RADIANS(:nearLng)) + 
                    SIN(RADIANS(:nearLat)) * SIN(RADIANS(listing.locationLat))
                ))
            ))`;

            qb.addSelect(haversineFormula, 'distanceKm')
                .andWhere(`${haversineFormula} <= :radiusKm`, {
                    nearLat: query.nearLat,
                    nearLng: query.nearLng,
                    radiusKm: query.radiusKm,
                })
                .orderBy('distanceKm', 'ASC');
        } else {
            qb.orderBy('listing.createdAt', 'DESC');
        }

        return qb.getMany();
    }

    async findOne(id: number): Promise<WasteListing> {
        const listing = await this.wasteListingRepository.findOne({
            where: { id },
            relations: ['generator'],
        });

        if (!listing) {
            throw new NotFoundException(`Waste listing with ID ${id} not found`);
        }

        return listing;
    }

    async updateStatus(
        id: number,
        updateDto: UpdateWasteListingStatusDto,
        user: User,
    ): Promise<WasteListing> {
        const listing = await this.findOne(id);

        const isOwner = listing.generatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;
        const isFacility = user.role === UserRole.FACILITY;

        if (!isOwner && !isAdmin && !isFacility) {
            throw new ForbiddenException(
                'You do not have permission to update this waste listing status',
            );
        }

        listing.status = updateDto.status;
        return this.wasteListingRepository.save(listing);
    }

    async remove(id: number, user: User): Promise<{ message: string }> {
        const listing = await this.findOne(id);

        const isOwner = listing.generatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('You can only delete your own waste listings');
        }

        if (listing.status !== WasteListingStatus.LISTED) {
            throw new BadRequestException(
                'Cannot delete a waste listing that has already been matched, scheduled, or collected',
            );
        }

        await this.wasteListingRepository.remove(listing);
        return { message: 'Waste listing deleted successfully' };
    }
}
