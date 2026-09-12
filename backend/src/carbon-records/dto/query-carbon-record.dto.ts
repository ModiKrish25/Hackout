import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WasteType } from '../../common/enums/waste-type.enum';
import { ConversionPathway } from '../../common/enums/conversion-pathway.enum';

export class QueryCarbonRecordDto {
    @ApiPropertyOptional({ description: 'Filter records tied to a specific generator ID', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    generatorId?: number;

    @ApiPropertyOptional({ description: 'Filter by match ID', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    matchId?: number;

    @ApiPropertyOptional({ description: 'Filter by waste type', enum: WasteType })
    @IsOptional()
    @IsEnum(WasteType)
    wasteType?: WasteType;

    @ApiPropertyOptional({ description: 'Filter by conversion pathway', enum: ConversionPathway })
    @IsOptional()
    @IsEnum(ConversionPathway)
    conversionPathway?: ConversionPathway;
}
