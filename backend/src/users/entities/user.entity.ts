import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.GENERATOR,
    })
    role: UserRole;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', unique: true, length: 255 })
    email: string;

    @Exclude()
    @Column({ type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    locationLat: number | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    locationLng: number | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
