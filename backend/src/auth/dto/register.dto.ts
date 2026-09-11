import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { Type } from 'class-transformer';

export class RegisterDto {
    @ApiProperty({ description: 'The full name of the user', example: 'Alen' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ description: 'The email address of the user', example: 'alen@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User password (minimum 6 characters)', example: 'StrongPassword123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ description: 'User role', enum: UserRole, default: UserRole.GENERATOR })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: 'Latitude coordinate', example: 12.971598 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    location_lat?: number;

    @ApiPropertyOptional({ description: 'Longitude coordinate', example: 77.594566 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    location_lng?: number;
}
