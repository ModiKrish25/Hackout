import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { QueryFacilityDto } from './dto/query-facility.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FacilitiesService {
    constructor(
        @InjectRepository(Facility)
        private readonly facilityRepository: Repository<Facility>,
    ) { }

    async create(operatorId: number, createDto: CreateFacilityDto): Promise<Facility> {
        const facility = this.facilityRepository.create({
            ...createDto,
            operatorId,
            currentUtilization: createDto.currentUtilization ?? 0,
        });

        return this.facilityRepository.save(facility);
    }

    async findAll(query: QueryFacilityDto): Promise<Facility[]> {
        const qb = this.facilityRepository
            .createQueryBuilder('facility')
            .leftJoinAndSelect('facility.operator', 'operator');

        if (query.facilityType) {
            qb.andWhere('facility.facilityType = :facilityType', {
                facilityType: query.facilityType,
            });
        }

        if (query.acceptedWasteType) {
            // Checks if acceptedWasteType is present in the simple-json array
            qb.andWhere('facility.acceptedWasteTypes LIKE :wasteTypePattern', {
                wasteTypePattern: `%"${query.acceptedWasteType}"%`,
            });
        }

        if (
            query.nearLat !== undefined &&
            query.nearLng !== undefined &&
            query.radiusKm !== undefined
        ) {
            const haversineFormula = `(6371 * ACOS(
                LEAST(1.0, GREATEST(-1.0, 
                    COS(RADIANS(:nearLat)) * COS(RADIANS(facility.locationLat)) * 
                    COS(RADIANS(facility.locationLng) - RADIANS(:nearLng)) + 
                    SIN(RADIANS(:nearLat)) * SIN(RADIANS(facility.locationLat))
                ))
            ))`;

            qb.addSelect(haversineFormula, 'distanceKm')
                .andWhere(`${haversineFormula} <= :radiusKm`, {
                    nearLat: query.nearLat,
                    nearLng: query.nearLng,
                    radiusKm: query.radiusKm,
                })
                .orderBy('distanceKm', 'ASC');
        }

        return qb.getMany();
    }

    async findOne(id: number): Promise<Facility> {
        const facility = await this.facilityRepository.findOne({
            where: { id },
            relations: ['operator'],
        });

        if (!facility) {
            throw new NotFoundException(`Facility with ID ${id} not found`);
        }

        return facility;
    }

    async findOneWithDetails(id: number): Promise<Facility & { utilizationPercentage: number; remainingCapacityTonsPerWeek: number }> {
        const facility = await this.findOne(id);

        const capacity = Number(facility.capacityTonsPerWeek);
        const utilization = Number(facility.currentUtilization);

        const utilizationPercentage =
            capacity > 0 ? Number(((utilization / capacity) * 100).toFixed(2)) : 0;
        const remainingCapacityTonsPerWeek = Number(
            Math.max(0, capacity - utilization).toFixed(2),
        );

        return {
            ...facility,
            utilizationPercentage,
            remainingCapacityTonsPerWeek,
        };
    }

    async update(
        id: number,
        updateDto: UpdateFacilityDto,
        user: User,
    ): Promise<Facility> {
        const facility = await this.findOne(id);

        const isOwner = facility.operatorId === user.id;
        const isAdmin = user.role === UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException(
                'You do not have permission to update this facility',
            );
        }

        if (updateDto.currentUtilization !== undefined && updateDto.capacityTonsPerWeek !== undefined) {
            if (updateDto.currentUtilization > updateDto.capacityTonsPerWeek) {
                throw new BadRequestException('currentUtilization cannot exceed capacityTonsPerWeek');
            }
        } else if (updateDto.currentUtilization !== undefined) {
            if (updateDto.currentUtilization > Number(facility.capacityTonsPerWeek)) {
                throw new BadRequestException('currentUtilization cannot exceed facility capacity');
            }
        }

        this.facilityRepository.merge(facility, updateDto);
        return this.facilityRepository.save(facility);
    }

    async getRemainingCapacity(facilityId: number): Promise<number> {
        const facility = await this.findOne(facilityId);
        const capacity = Number(facility.capacityTonsPerWeek);
        const utilization = Number(facility.currentUtilization);
        const remaining = capacity - utilization;
        return Number(Math.max(0, remaining).toFixed(2));
    }
}
