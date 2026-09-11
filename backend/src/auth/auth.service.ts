import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens } from './interfaces/tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
        const user = await this.usersService.create(registerDto);
        const tokens = await this.getTokens(user.userId, user.email, user.role);
        await this.updateRefreshTokenHash(user.userId, tokens.refreshToken);

        const { password_hash, refresh_token_hash, ...safeUser } = user;
        return {
            user: safeUser,
            tokens,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.getTokens(user.userId, user.email, user.role);
        await this.updateRefreshTokenHash(user.userId, tokens.refreshToken);

        const { password_hash, refresh_token_hash, ...safeUser } = user;
        return {
            user: safeUser,
            tokens,
        };
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
        if (!refreshSecret) {
            throw new Error('JWT_REFRESH_SECRET is not configured in environment');
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(refreshTokenDto.refreshToken, {
                secret: refreshSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.usersService.findOne(payload.sub);
        if (!user || !user.refresh_token_hash) {
            throw new UnauthorizedException('Access denied');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshTokenDto.refreshToken, user.refresh_token_hash);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokens = await this.getTokens(user.userId, user.email, user.role);
        await this.updateRefreshTokenHash(user.userId, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: number): Promise<{ message: string }> {
        await this.usersService.updateRefreshTokenHash(userId, null);
        return { message: 'Logged out successfully' };
    }

    private async updateRefreshTokenHash(userId: number, refreshToken: string): Promise<void> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(refreshToken, salt);
        await this.usersService.updateRefreshTokenHash(userId, hash);
    }

    private async getTokens(userId: number, email: string, role: UserRole): Promise<AuthTokens> {
        const payload: JwtPayload = {
            sub: userId,
            email,
            role,
        };

        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
        const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT secrets are not properly configured in environment');
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload as any, {
                secret: accessSecret,
                expiresIn: accessExpiresIn as any,
            }),
            this.jwtService.signAsync(payload as any, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
