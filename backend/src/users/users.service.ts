import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { APP_MESSAGES } from '../common/constants/messages';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(createUserDto.password, salt);

        const { password, ...userData } = createUserDto;
        const user = this.userRepository.create({
            ...userData,
            password_hash,
        });

        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            throw new NotFoundException(APP_MESSAGES.NOT_FOUND);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateRefreshTokenHash(userId: number, refreshTokenHash: string | null): Promise<void> {
        await this.userRepository.update(userId, {
            refresh_token_hash: refreshTokenHash,
        });
    }

    async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(userId);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }
        }

        let password_hash = user.password_hash;
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(updateUserDto.password, salt);
        }

        const { password, ...restDto } = updateUserDto;
        this.userRepository.merge(user, {
            ...restDto,
            password_hash,
        });

        return this.userRepository.save(user);
    }

    async remove(userId: number): Promise<void> {
        const user = await this.findOne(userId);
        await this.userRepository.remove(user);
    }
}
