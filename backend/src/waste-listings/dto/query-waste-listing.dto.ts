import { IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WasteType } from '../../common/enums/waste-type.enum';
import { WasteListingStatus } from '../../common/enums/waste-listing-status.enum';

export class QueryWasteListingDto {
    @ApiPropertyOptional({ description: 'Filter by waste type', enum: WasteType })
    @IsOptional()
    @IsEnum(WasteType)
    wasteType?: WasteType;

    @ApiPropertyOptional({ description: 'Filter by listing status', enum: WasteListingStatus })
    @IsOptional()
    @IsEnum(WasteListingStatus)
    status?: WasteListingStatus;

    @ApiPropertyOptional({ description: 'Latitude for proximity search', example: 12.971598 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    nearLat?: number;

    @ApiPropertyOptional({ description: 'Longitude for proximity search', example: 77.594566 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    nearLng?: number;

    @ApiPropertyOptional({ description: 'Radius in kilometers for proximity search', example: 25.0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    radiusKm?: number;
}
