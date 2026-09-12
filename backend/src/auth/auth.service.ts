import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const user = await this.usersService.create(registerDto);
        const token = await this.generateToken(user);

        const { passwordHash, ...safeUser } = user;
        return {
            user: safeUser,
            token,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = await this.generateToken(user);

        const { passwordHash, ...safeUser } = user;
        return {
            user: safeUser,
            token,
        };
    }

    private async generateToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
        };

        const secret = this.configService.get<string>('JWT_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret';

        return this.jwtService.signAsync(payload as any, {
            secret,
            expiresIn: '24h',
        });
    }
}
