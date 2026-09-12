import { IsNotEmpty, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMatchDto {
    @ApiProperty({ description: 'ID of the waste listing to match', example: 1 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    listingId: number;

    @ApiProperty({ description: 'ID of the target facility', example: 2 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    facilityId: number;

    @ApiProperty({ description: 'Matched quantity in tons', example: 5.0 })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    matchedQuantityTons: number;

    @ApiPropertyOptional({ description: 'Match score calculated from candidate search (0 - 100)', example: 87.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    matchScore?: number;
}
