import { WasteType } from '../../common/enums/waste-type.enum';
import { ConversionPathway } from '../../common/enums/conversion-pathway.enum';

export interface EmissionFactorEntry {
    [pathway: string]: number;
    landfillBaseline: number;
}

export const EMISSION_FACTORS: Record<string, EmissionFactorEntry> = {
    [WasteType.FOOD]: {
        [ConversionPathway.BIOGAS]: 0.35,
        [ConversionPathway.COMPOSTING]: 0.15,
        [ConversionPathway.BIOCHAR]: 0.40,
        landfillBaseline: 0.50,
    },
    [WasteType.AGRICULTURAL]: {
        [ConversionPathway.BIOCHAR]: 0.60,
        [ConversionPathway.BIOGAS]: 0.30,
        [ConversionPathway.COMPOSTING]: 0.20,
        landfillBaseline: 0.40,
    },
    [WasteType.MANURE]: {
        [ConversionPathway.BIOGAS]: 0.40,
        [ConversionPathway.COMPOSTING]: 0.20,
        [ConversionPathway.BIOCHAR]: 0.45,
        landfillBaseline: 0.45,
    },
    [WasteType.INDUSTRIAL_ORGANIC]: {
        [ConversionPathway.BIOCHAR]: 0.55,
        [ConversionPathway.BIOGAS]: 0.30,
        [ConversionPathway.COMPOSTING]: 0.25,
        landfillBaseline: 0.35,
    },
};
