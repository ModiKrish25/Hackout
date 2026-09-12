import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WasteListing } from '../../waste-listings/entities/waste-listing.entity';
import { Facility } from '../../facilities/entities/facility.entity';
import { MatchStatus } from '../../common/enums/match-status.enum';

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    listingId: number;

    @ManyToOne(() => WasteListing, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'listingId' })
    listing: WasteListing;

    @Column()
    facilityId: number;

    @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'facilityId' })
    facility: Facility;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    matchedQuantityTons: number;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    })
    matchScore: number | null;

    @Column({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.PENDING,
    })
    status: MatchStatus;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
