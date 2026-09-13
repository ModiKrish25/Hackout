import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { ConversionPathway } from '../../common/enums/conversion-pathway.enum';
import { WasteType } from '../../common/enums/waste-type.enum';

@Entity('carbon_records')
export class CarbonRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    matchId: number;

    @ManyToOne(() => Match, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'matchId' })
    match: Match;

    @Column({
        type: 'enum',
        enum: WasteType,
    })
    wasteType: WasteType;

    @Column({
        type: 'enum',
        enum: ConversionPathway,
    })
    conversionPathway: ConversionPathway;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    quantityTons: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
    })
    co2SequesteredTons: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
    })
    landfillBaselineEmissionsTons: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
    })
    netCarbonBenefitTons: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
    })
    baselineEmissions: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
    })
    storageEmissions: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
    })
    transportEmissions: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
    })
    processingEmissions: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
    })
    netCo2e: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
