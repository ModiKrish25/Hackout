import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonRecord } from './entities/carbon-record.entity';
import { EMISSION_FACTORS } from './constants/emission-factors';
import { WasteType } from '../common/enums/waste-type.enum';
import { ConversionPathway } from '../common/enums/conversion-pathway.enum';
import { Match } from '../matches/entities/match.entity';
import { QueryCarbonRecordDto } from './dto/query-carbon-record.dto';

export interface CarbonImpactCalculation {
    co2SequesteredTons: number;
    landfillBaselineEmissionsTons: number;
    netCarbonBenefitTons: number;
    baselineEmissions: number;
    storageEmissions: number;
    transportEmissions: number;
    processingEmissions: number;
    netCo2e: number;
}

export interface CarbonSummaryResult {
    totalCo2SequesteredTons: number;
    totalLandfillBaselineEmissionsTons: number;
    totalNetCarbonBenefitTons: number;
    totalQuantityTonsProcessed: number;
    totalRecordsCount: number;
    pathwayBreakdown: Record<string, number>;
}

@Injectable()
export class CarbonRecordsService {
    constructor(
        @InjectRepository(CarbonRecord)
        private readonly carbonRecordRepository: Repository<CarbonRecord>,
    ) { }

    calculateCarbonImpact(
        wasteType: WasteType,
        conversionPathway: ConversionPathway,
        quantityTons: number,
        distanceKm: number = 25,
    ): CarbonImpactCalculation {
        const wasteFactors = EMISSION_FACTORS[wasteType] || {
            [conversionPathway]: 0.35,
            landfillBaseline: 0.40,
        };

        const sequesteredFactor = wasteFactors[conversionPathway] ?? 0.30;
        const baselineFactor = wasteFactors.landfillBaseline ?? 0.40;

        // Step 1: Landfill baseline avoided methane emissions (tCO2e)
        const baselineEmissions = Number((quantityTons * baselineFactor).toFixed(4));

        // Step 2: Durable carbon storage via pyrolysis/digestion (tCO2e with 44/12 C->CO2 stoichiometry)
        const storageEmissions = Number((quantityTons * sequesteredFactor).toFixed(4));

        // Step 3: Logistics transport deduction (tCO2e)
        const transportEmissions = Number(((distanceKm * 2 * 0.62) / 1000).toFixed(4));

        // Step 4: Plant processing energy deduction (tCO2e)
        const processingEmissions = Number(((quantityTons * 15.2) / 1000).toFixed(4));

        // Step 5: Net verified carbon benefit (tCO2e)
        const netCo2e = Number(
            Math.max(0, baselineEmissions + storageEmissions - transportEmissions - processingEmissions).toFixed(4),
        );

        return {
            co2SequesteredTons: storageEmissions,
            landfillBaselineEmissionsTons: baselineEmissions,
            netCarbonBenefitTons: netCo2e,
            baselineEmissions,
            storageEmissions,
            transportEmissions,
            processingEmissions,
            netCo2e,
        };
    }

    async createForMatch(match: Match): Promise<CarbonRecord> {
        // Prevent duplicate records for the same match
        const existing = await this.carbonRecordRepository.findOne({
            where: { matchId: match.id },
        });
        if (existing) {
            return existing;
        }

        const wasteType = match.listing?.wasteType || WasteType.FOOD;
        const conversionPathway = (match.facility?.facilityType as unknown as ConversionPathway) || ConversionPathway.BIOGAS;
        const quantityTons = Number(match.matchedQuantityTons || 0);

        const impact = this.calculateCarbonImpact(wasteType, conversionPathway, quantityTons);

        const record = this.carbonRecordRepository.create({
            matchId: match.id,
            wasteType,
            conversionPathway,
            quantityTons,
            co2SequesteredTons: impact.co2SequesteredTons,
            landfillBaselineEmissionsTons: impact.landfillBaselineEmissionsTons,
            netCarbonBenefitTons: impact.netCarbonBenefitTons,
            baselineEmissions: impact.baselineEmissions,
            storageEmissions: impact.storageEmissions,
            transportEmissions: impact.transportEmissions,
            processingEmissions: impact.processingEmissions,
            netCo2e: impact.netCo2e,
        });

        return this.carbonRecordRepository.save(record);
    }

    async getSummary(): Promise<CarbonSummaryResult> {
        const records = await this.carbonRecordRepository.find();

        let totalCo2SequesteredTons = 0;
        let totalLandfillBaselineEmissionsTons = 0;
        let totalNetCarbonBenefitTons = 0;
        let totalQuantityTonsProcessed = 0;
        const pathwayBreakdown: Record<string, number> = {};

        for (const r of records) {
            totalCo2SequesteredTons += Number(r.co2SequesteredTons);
            totalLandfillBaselineEmissionsTons += Number(r.landfillBaselineEmissionsTons);
            totalNetCarbonBenefitTons += Number(r.netCarbonBenefitTons);
            totalQuantityTonsProcessed += Number(r.quantityTons);

            const pathway = r.conversionPathway;
            pathwayBreakdown[pathway] = Number(
                ((pathwayBreakdown[pathway] || 0) + Number(r.netCarbonBenefitTons)).toFixed(4),
            );
        }

        return {
            totalCo2SequesteredTons: Number(totalCo2SequesteredTons.toFixed(4)),
            totalLandfillBaselineEmissionsTons: Number(totalLandfillBaselineEmissionsTons.toFixed(4)),
            totalNetCarbonBenefitTons: Number(totalNetCarbonBenefitTons.toFixed(4)),
            totalQuantityTonsProcessed: Number(totalQuantityTonsProcessed.toFixed(2)),
            totalRecordsCount: records.length,
            pathwayBreakdown,
        };
    }

    async findByMatchId(matchId: number): Promise<CarbonRecord> {
        const record = await this.carbonRecordRepository.findOne({
            where: { matchId },
            relations: ['match', 'match.listing', 'match.listing.generator', 'match.facility'],
        });

        if (!record) {
            throw new NotFoundException(`Carbon record for match ID ${matchId} not found`);
        }

        return record;
    }

    async findAll(query: QueryCarbonRecordDto): Promise<CarbonRecord[]> {
        const qb = this.carbonRecordRepository
            .createQueryBuilder('cr')
            .leftJoinAndSelect('cr.match', 'match')
            .leftJoinAndSelect('match.listing', 'listing')
            .leftJoinAndSelect('listing.generator', 'generator')
            .leftJoinAndSelect('match.facility', 'facility')
            .leftJoinAndSelect('facility.operator', 'operator');

        if (query.generatorId) {
            qb.andWhere('listing.generatorId = :generatorId', {
                generatorId: query.generatorId,
            });
        }

        if (query.matchId) {
            qb.andWhere('cr.matchId = :matchId', { matchId: query.matchId });
        }

        if (query.wasteType) {
            qb.andWhere('cr.wasteType = :wasteType', { wasteType: query.wasteType });
        }

        if (query.conversionPathway) {
            qb.andWhere('cr.conversionPathway = :conversionPathway', {
                conversionPathway: query.conversionPathway,
            });
        }

        qb.orderBy('cr.createdAt', 'DESC');
        return qb.getMany();
    }
}
