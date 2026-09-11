import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'userId' })
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', unique: true, length: 255 })
    email: string;

    @Exclude()
    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    password_hash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.GENERATOR,
    })
    role: UserRole;

    @Column({
        name: 'location_lat',
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    location_lat: number | null;

    @Column({
        name: 'location_lng',
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    location_lng: number | null;

    @Exclude()
    @Column({
        name: 'refresh_token_hash',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    refresh_token_hash: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdOn: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedOn: Date;
}
