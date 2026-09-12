import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FacilityType } from '../../common/enums/facility-type.enum';

@Entity('facilities')
export class Facility {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    operatorId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'operatorId' })
    operator: User;

    @Column({
        type: 'enum',
        enum: FacilityType,
    })
    facilityType: FacilityType;

    @Column({ type: 'simple-json' })
    acceptedWasteTypes: string[];

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    capacityTonsPerWeek: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    currentUtilization: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
    })
    locationLat: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
    })
    locationLng: number;
}
