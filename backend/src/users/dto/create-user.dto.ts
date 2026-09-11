import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ description: 'The email of the user', example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The password of the user', example: 'password123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ description: 'User role', enum: UserRole, default: UserRole.GENERATOR })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: 'Latitude coordinate', example: 37.774929 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    location_lat?: number;

    @ApiPropertyOptional({ description: 'Longitude coordinate', example: -122.419416 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    location_lng?: number;
}
