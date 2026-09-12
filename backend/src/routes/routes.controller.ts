import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { GenerateRouteDto } from './dto/generate-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    @Get('health-check')
    @ApiOperation({ summary: 'Check connection to Python Route Optimization microservice' })
    @ApiResponse({ status: 200, description: 'Python optimization service is alive and healthy' })
    @ApiResponse({ status: 503, description: 'Python optimization service is unavailable' })
    async checkHealth() {
        const isHealthy = await this.routesService.checkPythonHealth();
        return { status: 'ok', pythonService: isHealthy ? 'available' : 'unavailable' };
    }

    @Post('generate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FACILITY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Generate an optimal collection route using Google OR-Tools Python microservice',
    })
    @ApiResponse({ status: 201, description: 'Route generated and saved successfully' })
    @ApiResponse({ status: 400, description: 'No scheduled matches to route' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Caller is not a facility operator' })
    @ApiResponse({ status: 502, description: 'Route optimization service returned an error' })
    @ApiResponse({ status: 503, description: 'Route optimization service is currently unavailable' })
    @ApiResponse({ status: 504, description: 'Route optimization timed out' })
    generateRoute(@Body() dto: GenerateRouteDto) {
        return this.routesService.generateRoute(dto);
    }

    @Get(':facilityId/:date')
    @ApiOperation({
        summary: 'Get saved route for a facility on a specific date with ordered listing details for map rendering',
    })
    @ApiResponse({ status: 200, description: 'Return route details and ordered stops' })
    @ApiResponse({ status: 404, description: 'No route exists for this facility/date' })
    getRouteByFacilityAndDate(
        @Param('facilityId', ParseIntPipe) facilityId: number,
        @Param('date') date: string,
    ) {
        return this.routesService.getRouteByFacilityAndDate(facilityId, date);
    }

    @Get()
    @ApiOperation({ summary: 'Get all routes' })
    @ApiResponse({ status: 200, description: 'Return all routes' })
    findAll() {
        return this.routesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a route by ID' })
    @ApiResponse({ status: 200, description: 'Return a single route' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.routesService.findOne(id);
    }
}
