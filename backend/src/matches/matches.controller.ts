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
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { QueryMatchDto } from './dto/query-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Post('find-candidates/:listingId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Find and score compatible facilities for a waste listing (Top 5 ranked by score)',
    })
    @ApiResponse({ status: 200, description: 'Return scored and ranked candidate facilities' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Waste listing not found' })
    findCandidates(@Param('listingId', ParseIntPipe) listingId: number) {
        return this.matchesService.findCandidates(listingId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a match between a waste listing and a facility' })
    @ApiResponse({ status: 201, description: 'Match created in pending status and listing updated to matched' })
    @ApiResponse({ status: 400, description: 'Validation failed or insufficient capacity' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createDto: CreateMatchDto) {
        return this.matchesService.create(createDto);
    }

    @Patch(':id/confirm')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FACILITY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Confirm a pending match (Facility operator only -> schedules match and increments utilization)',
    })
    @ApiResponse({ status: 200, description: 'Match confirmed and scheduled' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Caller is not the facility operator' })
    @ApiResponse({ status: 404, description: 'Match not found' })
    confirm(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.matchesService.confirm(id, user);
    }

    @Patch(':id/process')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FACILITY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Process a match (Facility operator only -> marks processed and automatically creates CarbonRecord)',
    })
    @ApiResponse({ status: 200, description: 'Match processed and CarbonRecord generated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Caller is not the facility operator' })
    @ApiResponse({ status: 404, description: 'Match not found' })
    process(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.matchesService.process(id, user);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FACILITY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Reject a pending match (Reverts listing back to listed status and removes match)',
    })
    @ApiResponse({ status: 200, description: 'Match rejected successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Caller is not the facility operator' })
    @ApiResponse({ status: 404, description: 'Match not found' })
    reject(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.matchesService.reject(id, user);
    }

    @Get()
    @ApiOperation({ summary: 'List matches with optional filters (facilityId, listingId, status)' })
    @ApiResponse({ status: 200, description: 'Return filtered matches' })
    findAll(@Query() query: QueryMatchDto) {
        return this.matchesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single match by ID with full relations' })
    @ApiResponse({ status: 200, description: 'Return match details' })
    @ApiResponse({ status: 404, description: 'Match not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.matchesService.findOne(id);
    }
}
