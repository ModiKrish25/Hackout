import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchStatus } from '../../common/enums/match-status.enum';

export class QueryMatchDto {
    @ApiPropertyOptional({ description: 'Filter by facility ID', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    facilityId?: number;

    @ApiPropertyOptional({ description: 'Filter by listing ID', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    listingId?: number;

    @ApiPropertyOptional({ description: 'Filter by match status', enum: MatchStatus })
    @IsOptional()
    @IsEnum(MatchStatus)
    status?: MatchStatus;
}
