import { IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FacilityType } from '../../common/enums/facility-type.enum';
import { WasteType } from '../../common/enums/waste-type.enum';

export class QueryFacilityDto {
    @ApiPropertyOptional({ description: 'Filter by facility type', enum: FacilityType })
    @IsOptional()
    @IsEnum(FacilityType)
    facilityType?: FacilityType;

    @ApiPropertyOptional({ description: 'Filter by accepted waste type', enum: WasteType })
    @IsOptional()
    @IsEnum(WasteType)
    acceptedWasteType?: WasteType;

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

    @ApiPropertyOptional({ description: 'Radius in kilometers for proximity search', example: 30.0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    radiusKm?: number;
}
