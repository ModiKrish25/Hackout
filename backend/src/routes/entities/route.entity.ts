import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Facility } from '../../facilities/entities/facility.entity';

@Entity('routes')
export class Route {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    facilityId: number;

    @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'facilityId' })
    facility: Facility;

    @Column({ type: 'date' })
    collectionDate: string;

    @Column({ type: 'simple-json' })
    stopOrder: number[];

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    totalDistanceKm: number | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    totalTravelTimeMin: number | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
