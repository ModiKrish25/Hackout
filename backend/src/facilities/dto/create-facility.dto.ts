import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsArray, ArrayNotEmpty, Min, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FacilityType } from '../../common/enums/facility-type.enum';
import { WasteType } from '../../common/enums/waste-type.enum';
import { Type } from 'class-transformer';

export class CreateFacilityDto {
    @ApiPropertyOptional({ description: 'Display name of the facility', example: 'GreenTech Anaerobic Digester' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Physical street address or industrial zone', example: 'Peenya Industrial Area Stage 2, Bengaluru' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'Type of facility', enum: FacilityType, example: FacilityType.BIOGAS })
    @IsEnum(FacilityType)
    @IsNotEmpty()
    facilityType: FacilityType;

    @ApiProperty({
        description: 'List of accepted waste types',
        enum: WasteType,
        isArray: true,
        example: [WasteType.FOOD, WasteType.AGRICULTURAL],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(WasteType, { each: true })
    acceptedWasteTypes: WasteType[];

    @ApiProperty({ description: 'Capacity in tons per week (must be > 0)', example: 150.0 })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    capacityTonsPerWeek: number;

    @ApiPropertyOptional({ description: 'Current utilization in tons per week', example: 0, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    currentUtilization?: number;

    @ApiProperty({ description: 'Latitude coordinate of the facility', example: 12.971598 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    locationLat: number;

    @ApiProperty({ description: 'Longitude coordinate of the facility', example: 77.594566 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    locationLng: number;
}
