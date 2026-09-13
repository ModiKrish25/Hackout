import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WasteType } from '../../common/enums/waste-type.enum';
import { Type } from 'class-transformer';

export class CreateWasteListingDto {
    @ApiProperty({ description: 'Type of waste', enum: WasteType, example: WasteType.FOOD })
    @IsEnum(WasteType)
    @IsNotEmpty()
    wasteType: WasteType;

    @ApiProperty({ description: 'Quantity in tons (must be greater than 0)', example: 5.5 })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    quantityTons: number;

    @ApiPropertyOptional({ description: 'Moisture content percentage (0 - 100)', example: 65.0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    moistureContent?: number;

    @ApiProperty({ description: 'Latitude coordinate of pickup location', example: 12.971598 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    locationLat: number;

    @ApiProperty({ description: 'Longitude coordinate of pickup location', example: 77.594566 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    locationLng: number;

    @ApiPropertyOptional({ description: 'Pickup gate address or landmark', example: 'Bengaluru Ag Farmgate, Gate #2' })
    @IsOptional()
    address?: string;

    @ApiProperty({ description: 'Availability start datetime (ISO string)', example: '2026-09-12T10:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    availableFrom: string;

    @ApiProperty({ description: 'Availability end datetime (ISO string)', example: '2026-09-15T18:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    availableTo: string;
}
