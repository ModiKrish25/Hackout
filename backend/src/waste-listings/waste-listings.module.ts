import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WasteListing } from './entities/waste-listing.entity';
import { WasteListingsService } from './waste-listings.service';
import { WasteListingsController } from './waste-listings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WasteListing]),
        AuthModule,
    ],
    controllers: [WasteListingsController],
    providers: [WasteListingsService],
    exports: [WasteListingsService],
})
export class WasteListingsModule { }
