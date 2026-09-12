import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WasteType } from '../../common/enums/waste-type.enum';
import { WasteListingStatus } from '../../common/enums/waste-listing-status.enum';

@Entity('waste_listings')
export class WasteListing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    generatorId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'generatorId' })
    generator: User;

    @Column({
        type: 'enum',
        enum: WasteType,
    })
    wasteType: WasteType;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    quantityTons: number;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    })
    moistureContent: number | null;

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

    @Column({ type: 'datetime' })
    availableFrom: Date;

    @Column({ type: 'datetime' })
    availableTo: Date;

    @Column({
        type: 'enum',
        enum: WasteListingStatus,
        default: WasteListingStatus.LISTED,
    })
    status: WasteListingStatus;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
