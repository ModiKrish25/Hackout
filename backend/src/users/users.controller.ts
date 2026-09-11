import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'Return a single user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
