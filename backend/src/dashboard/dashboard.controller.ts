import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('municipal/summary')
    @ApiOperation({
        summary: 'Get city-wide aggregate metrics for the Municipal / Regulator Dashboard',
    })
    @ApiResponse({
        status: 200,
        description: 'Return total listings, facilities, processed tonnage, CO2 sequestered, net carbon benefit, and match status breakdown',
    })
    getMunicipalSummary() {
        return this.dashboardService.getMunicipalSummary();
    }

    @Get('municipal/map-data')
    @ApiOperation({
        summary: 'Get all listings and facilities formatted directly for Leaflet.js map rendering',
    })
    @ApiResponse({
        status: 200,
        description: 'Return map data including coordinates, types, and statuses',
    })
    getMunicipalMapData() {
        return this.dashboardService.getMunicipalMapData();
    }

    @Get('generator/:generatorId/summary')
    @ApiOperation({
        summary: 'Get personal statistics for a specific Waste Generator',
    })
    @ApiResponse({
        status: 200,
        description: 'Return total listings, tons listed, tons diverted, CO2 credit earned, and status counts',
    })
    @ApiResponse({ status: 404, description: 'Generator not found' })
    getGeneratorSummary(@Param('generatorId', ParseIntPipe) generatorId: number) {
        return this.dashboardService.getGeneratorSummary(generatorId);
    }

    @Get('facility/:facilityId/summary')
    @ApiOperation({
        summary: 'Get operational statistics for a specific Processing Facility',
    })
    @ApiResponse({
        status: 200,
        description: 'Return capacity utilization, incoming matches breakdown, and tons processed',
    })
    @ApiResponse({ status: 404, description: 'Facility not found' })
    getFacilitySummary(@Param('facilityId', ParseIntPipe) facilityId: number) {
        return this.dashboardService.getFacilitySummary(facilityId);
    }
}
