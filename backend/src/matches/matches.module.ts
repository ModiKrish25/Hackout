import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { WasteListingsModule } from '../waste-listings/waste-listings.module';
import { FacilitiesModule } from '../facilities/facilities.module';
import { CarbonRecordsModule } from '../carbon-records/carbon-records.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match]),
        WasteListingsModule,
        FacilitiesModule,
        CarbonRecordsModule,
        AuthModule,
    ],
    controllers: [MatchesController],
    providers: [MatchesService],
    exports: [MatchesService],
})
export class MatchesModule { }
