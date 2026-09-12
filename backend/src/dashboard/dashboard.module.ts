import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WasteListing } from '../waste-listings/entities/waste-listing.entity';
import { Facility } from '../facilities/entities/facility.entity';
import { Match } from '../matches/entities/match.entity';
import { CarbonRecord } from '../carbon-records/entities/carbon-record.entity';
import { User } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { FacilitiesModule } from '../facilities/facilities.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WasteListing, Facility, Match, CarbonRecord, User]),
        FacilitiesModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
