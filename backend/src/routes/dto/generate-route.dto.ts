import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GenerateRouteDto {
    @ApiProperty({ description: 'ID of the processing facility', example: 1 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    facilityId: number;

    @ApiProperty({ description: 'Collection date for the route (YYYY-MM-DD)', example: '2026-09-15' })
    @IsString()
    @IsNotEmpty()
    collectionDate: string;
}
