import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WasteListingsService } from './waste-listings.service';
import { CreateWasteListingDto } from './dto/create-waste-listing.dto';
import { UpdateWasteListingStatusDto } from './dto/update-waste-listing-status.dto';
import { QueryWasteListingDto } from './dto/query-waste-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Waste Listings')
@Controller('waste-listings')
export class WasteListingsController {
    constructor(private readonly wasteListingsService: WasteListingsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.GENERATOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new waste listing (Generator only)' })
    @ApiResponse({ status: 201, description: 'Waste listing created successfully' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Requires generator role' })
    create(@GetUser() user: User, @Body() createDto: CreateWasteListingDto) {
        return this.wasteListingsService.create(user.id, createDto);
    }

    @Get()
    @ApiOperation({
        summary: 'List all waste listings with optional filters (wasteType, status, proximity)',
    })
    @ApiResponse({ status: 200, description: 'Return filtered or all waste listings' })
    findAll(@Query() query: QueryWasteListingDto) {
        return this.wasteListingsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single waste listing by ID' })
    @ApiResponse({ status: 200, description: 'Return waste listing details' })
    @ApiResponse({ status: 404, description: 'Waste listing not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.wasteListingsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update waste listing status (Restricted to owner, involved facility, or admin)',
    })
    @ApiResponse({ status: 200, description: 'Waste listing status updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Waste listing not found' })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateWasteListingStatusDto,
        @GetUser() user: User,
    ) {
        return this.wasteListingsService.updateStatus(id, updateDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a waste listing (Only if status is listed, restricted to owner or admin)',
    })
    @ApiResponse({ status: 200, description: 'Waste listing deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete matched/scheduled listings' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Waste listing not found' })
    remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.wasteListingsService.remove(id, user);
    }
}
