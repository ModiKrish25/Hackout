import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'The email address of the user', example: 'alen@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User password', example: 'StrongPassword123' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
