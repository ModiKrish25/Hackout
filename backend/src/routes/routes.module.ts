import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Route } from './entities/route.entity';
import { Match } from '../matches/entities/match.entity';
import { WasteListing } from '../waste-listings/entities/waste-listing.entity';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { FacilitiesModule } from '../facilities/facilities.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Route, Match, WasteListing]),
        HttpModule,
        ConfigModule,
        FacilitiesModule,
        AuthModule,
    ],
    controllers: [RoutesController],
    providers: [RoutesService],
    exports: [RoutesService],
})
export class RoutesModule { }
