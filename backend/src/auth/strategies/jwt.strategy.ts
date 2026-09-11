import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not configured in environment');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }
        return user;
    }
}
