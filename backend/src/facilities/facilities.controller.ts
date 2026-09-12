import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { QueryFacilityDto } from './dto/query-facility.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FACILITY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new processing facility (Facility operator only)' })
    @ApiResponse({ status: 201, description: 'Facility created successfully' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Requires facility role' })
    create(@GetUser() user: User, @Body() createDto: CreateFacilityDto) {
        return this.facilitiesService.create(user.id, createDto);
    }

    @Get()
    @ApiOperation({
        summary: 'List all facilities with optional filters (facilityType, acceptedWasteType, proximity)',
    })
    @ApiResponse({ status: 200, description: 'Return all or filtered facilities' })
    findAll(@Query() query: QueryFacilityDto) {
        return this.facilitiesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a single facility by ID with utilization percentage and remaining capacity',
    })
    @ApiResponse({ status: 200, description: 'Return facility details' })
    @ApiResponse({ status: 404, description: 'Facility not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.facilitiesService.findOneWithDetails(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update facility details or utilization (Restricted to owning operator or admin)',
    })
    @ApiResponse({ status: 200, description: 'Facility updated successfully' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Facility not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateFacilityDto,
        @GetUser() user: User,
    ) {
        return this.facilitiesService.update(id, updateDto, user);
    }
}
