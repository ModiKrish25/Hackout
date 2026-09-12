import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Facility]),
        AuthModule,
    ],
    controllers: [FacilitiesController],
    providers: [FacilitiesService],
    exports: [FacilitiesService],
})
export class FacilitiesModule { }
