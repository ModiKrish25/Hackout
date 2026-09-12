import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CarbonRecordsService } from './carbon-records.service';
import { QueryCarbonRecordDto } from './dto/query-carbon-record.dto';

@ApiTags('Carbon Records')
@Controller('carbon-records')
export class CarbonRecordsController {
    constructor(private readonly carbonRecordsService: CarbonRecordsService) { }

    @Get('summary')
    @ApiOperation({
        summary: 'Get aggregated carbon impact metrics (Municipal Dashboard)',
    })
    @ApiResponse({
        status: 200,
        description: 'Return total CO2 sequestered, avoided landfill emissions, net benefit, and tons processed',
    })
    getSummary() {
        return this.carbonRecordsService.getSummary();
    }

    @Get(':matchId')
    @ApiOperation({ summary: 'Get carbon record for a specific match' })
    @ApiResponse({ status: 200, description: 'Return carbon record details' })
    @ApiResponse({ status: 404, description: 'Carbon record not found' })
    findByMatchId(@Param('matchId', ParseIntPipe) matchId: number) {
        return this.carbonRecordsService.findByMatchId(matchId);
    }

    @Get()
    @ApiOperation({
        summary: 'List carbon records with optional filters (generatorId, matchId, wasteType, conversionPathway)',
    })
    @ApiResponse({ status: 200, description: 'Return filtered carbon records' })
    findAll(@Query() query: QueryCarbonRecordDto) {
        return this.carbonRecordsService.findAll(query);
    }
}
