import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonRecord } from './entities/carbon-record.entity';
import { CarbonRecordsService } from './carbon-records.service';
import { CarbonRecordsController } from './carbon-records.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CarbonRecord])],
    controllers: [CarbonRecordsController],
    providers: [CarbonRecordsService],
    exports: [CarbonRecordsService],
})
export class CarbonRecordsModule { }
