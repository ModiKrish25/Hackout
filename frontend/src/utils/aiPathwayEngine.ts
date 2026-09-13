/**
 * Waste2Carbon AI Waste Pathway Recommendation Engine
 * Intelligent multi-criteria evaluation of organic feedstock characteristics:
 * - Dry matter content & moisture percentage
 * - Lignocellulosic carbon density vs digestible volatile solids
 * - Logistics transport radius economics & energy density
 * - Market commodity value (Biochar soil sink vs Grid power vs Bio-CNG vehicle fuel vs Humic compost)
 * - Carbon permanence duration (IPCC / Verra VM0044)
 */

import { calculateCarbonImpact, type ConversionPathwayType, WASTE_CARBON_FACTORS } from './carbonEngine'

export interface AIPathwayRecommendation {
  pathwayId: ConversionPathwayType
  name: string
  shortName: string
  rank: 1 | 2 | 3 | 4
  matchConfidence: number // 0 to 100
  isPrimary: boolean
  carbonYieldTCO2e: number
  carbonPotential: 'Very High' | 'High' | 'Medium' | 'Moderate'
  economicReturnINR: number
  pricePerTonINR: number
  permanenceRating: string
  comparisonTags: string[]
  scientificRationale: string
  recommendedEquipment: string
  marketCommodity: string
  pros: string[]
  cons: string[]
}

export interface AIPathwayAnalysisResult {
  wasteType: string
  feedstockName: string
  quantityTons: number
  moisturePercent: number
  dryMatterTons: number
  primaryRecommendation: AIPathwayRecommendation
  allRecommendations: AIPathwayRecommendation[]
  aiSummary: string
  highestCarbonPathway: ConversionPathwayType
  highestRevenuePathway: ConversionPathwayType
}

export interface AIPathwayInput {
  wasteType: string // 'agricultural' | 'food' | 'manure' | 'industrial_organic'
  quantityTons: number
  moisturePercent?: number
  distanceKm?: number
}

// Commodity market pricing benchmarks in India (INR per ton feedstock processed)
const PATHWAY_COMMODITY_PRICING: Record<
  ConversionPathwayType,
  {
    baseTippingFeeINR: number
    productYieldPriceFactorINR: number
    carbonCreditValuePerTonINR: number // ₹1,500 per verified tCO2e
    permanenceDesc: string
    recommendedTech: string
    commodityLabel: string
    tags: string[]
  }
> = {
  biochar: {
    baseTippingFeeINR: 450,
    productYieldPriceFactorINR: 2200, // Biochar sells at ₹12,000-18,000/ton; ~0.3t yield = ~₹4,500 gross value
    carbonCreditValuePerTonINR: 1500, // High-durability CDR credits (CORC / Verra)
    permanenceDesc: '100+ Years (Verra VM0044 Aromatic Ring Stability)',
    recommendedTech: 'Continuous Rotary Pyrolysis Kiln (600°C - 700°C)',
    commodityLabel: 'High-Purity Biochar Soil Amendment & Verra CDR Credits',
    tags: ['High Permanence', 'Carbon Credits (CORC)', 'Water Retention'],
  },
  biogas: {
    baseTippingFeeINR: 300,
    productYieldPriceFactorINR: 1200, // Electricity generated ~120 kWh/t @ ₹6.5/kWh
    carbonCreditValuePerTonINR: 900,
    permanenceDesc: '10-15 Years (Grid Methane & Coal Power Displacement)',
    recommendedTech: 'Continuous Stirred-Tank Anaerobic Digester (CSTR)',
    commodityLabel: 'Renewable Baseload Grid Electricity & Liquid Bio-Fertilizer',
    tags: ['Grid Power', 'Continuous Baseload', 'Liquid Digestate'],
  },
  biomethane: {
    baseTippingFeeINR: 350,
    productYieldPriceFactorINR: 1800, // Bio-CNG sells at ₹75/kg to city gas distribution (SATAT scheme)
    carbonCreditValuePerTonINR: 1100,
    permanenceDesc: '15-20 Years (Diesel & Fossil CNG Vehicle Displacement)',
    recommendedTech: 'High-Solids Plug Flow Digester with PSA Gas Upgrading',
    commodityLabel: 'Compressed Bio-CNG Fuel (SATAT Scheme) & Organic Manure',
    tags: ['Immediate Cashflow', 'SATAT Bio-CNG', 'Fossil Fuel Offset'],
  },
  compost: {
    baseTippingFeeINR: 200,
    productYieldPriceFactorINR: 600, // Bulk compost sells at ₹2,500-4,000/t; ~0.5t yield
    carbonCreditValuePerTonINR: 400,
    permanenceDesc: '5-10 Years (Labile Soil Humic Fraction)',
    recommendedTech: 'Forced Aeration Windrow Composting System',
    commodityLabel: 'Enriched FCO-Grade Organic Compost Fertilizer',
    tags: ['Local Farm Use', 'Low Capital Tech', 'Quick Turnaround'],
  },
}

/**
 * Analyzes waste characteristics and generates intelligent, ranked pathway recommendations
 */
export function analyzeWastePathway(inputs: AIPathwayInput): AIPathwayAnalysisResult {
  const { wasteType, quantityTons } = inputs
  const standardConfig = WASTE_CARBON_FACTORS[wasteType] || WASTE_CARBON_FACTORS.agricultural
  const moisture = inputs.moisturePercent ?? standardConfig.defaultMoisture
  const distance = inputs.distanceKm ?? 40

  const dryMatterFraction = Math.max(0.1, (100 - moisture) / 100)
  const dryMatterTons = Number((quantityTons * dryMatterFraction).toFixed(1))

  // Evaluation Pathways
  const pathways: ConversionPathwayType[] = ['biochar', 'biogas', 'biomethane', 'compost']

  const evaluatedRecommendations: AIPathwayRecommendation[] = pathways.map((pathwayId) => {
    const config = PATHWAY_COMMODITY_PRICING[pathwayId]

    // Calculate live carbon figures via the official 5-step carbon accounting engine
    const carbonRes = calculateCarbonImpact({
      wasteType,
      quantityTons,
      distanceKm: distance,
      pathway: pathwayId,
      moisturePercent: moisture,
    })

    // Scientific Suitability Algorithm
    let suitabilityScore = 50 // Base neutral score

    // Factor 1: Moisture & Dry Matter Compatibility (35% weight)
    if (pathwayId === 'biochar') {
      // Biochar thrives on dry feedstock (<25% moisture)
      if (moisture <= 18) suitabilityScore += 35
      else if (moisture <= 30) suitabilityScore += 20
      else if (moisture <= 45) suitabilityScore -= 10
      else suitabilityScore -= 35 // High moisture requires excessive pre-drying thermal energy
    } else if (pathwayId === 'biogas' || pathwayId === 'biomethane') {
      // Anaerobic digestion requires high/moderate moisture (>40%)
      if (moisture >= 60) suitabilityScore += 30
      else if (moisture >= 40) suitabilityScore += 25
      else if (moisture >= 25) suitabilityScore += 10
      else suitabilityScore -= 15 // Dry stubble requires extensive water addition and enzyme pre-treatment
    } else if (pathwayId === 'compost') {
      // Composting optimal range is 40-60% moisture
      if (moisture >= 40 && moisture <= 60) suitabilityScore += 25
      else if (moisture > 60) suitabilityScore += 10
      else suitabilityScore += 15
    }

    // Factor 2: Carbon Density & Feedstock Chemistry (25% weight)
    if (wasteType === 'agricultural') {
      // High silica, lignin, rigid cell walls: ideal for Pyrolysis
      if (pathwayId === 'biochar') suitabilityScore += 15
      if (pathwayId === 'biomethane') suitabilityScore += 5
      if (pathwayId === 'compost') suitabilityScore += 2
    } else if (wasteType === 'food') {
      // High digestible soluble organics & fats: ideal for Bio-CNG / Biogas
      if (pathwayId === 'biomethane') suitabilityScore += 18
      if (pathwayId === 'biogas') suitabilityScore += 15
      if (pathwayId === 'compost') suitabilityScore += 8
      if (pathwayId === 'biochar') suitabilityScore -= 10
    } else if (wasteType === 'manure') {
      // Low C:N ratio, methanogenic bacteria present: ideal for Biogas/Biomethane
      if (pathwayId === 'biogas') suitabilityScore += 18
      if (pathwayId === 'biomethane') suitabilityScore += 16
      if (pathwayId === 'compost') suitabilityScore += 10
      if (pathwayId === 'biochar') suitabilityScore -= 15
    } else {
      // Industrial organic
      if (pathwayId === 'biochar') suitabilityScore += 10
      if (pathwayId === 'biogas') suitabilityScore += 10
    }

    // Factor 3: Logistics & Haul Radius Economics (20% weight)
    if (distance <= 30) {
      suitabilityScore += 10 // Short haul benefits all
    } else if (distance > 75) {
      // Long distance favors high-value biochar, penalizes low-value wet compost
      if (pathwayId === 'biochar') suitabilityScore += 5
      if (pathwayId === 'compost') suitabilityScore -= 15
    }

    // Factor 4: Market Value & Carbon Offset Revenue (20% weight)
    const carbonCreditsRevenue = carbonRes.netCO2eBenefit * config.carbonCreditValuePerTonINR
    const commoditySalesRevenue = quantityTons * config.productYieldPriceFactorINR
    const tippingFeeRevenue = quantityTons * config.baseTippingFeeINR
    const totalEconomicReturn = Math.round(tippingFeeRevenue + commoditySalesRevenue + carbonCreditsRevenue)
    const effectivePricePerTon = Math.round(totalEconomicReturn / quantityTons)

    if (totalEconomicReturn > quantityTons * 1500) {
      suitabilityScore += 5
    }

    // Clamp score between 45 and 97
    const normalizedScore = Math.min(97, Math.max(45, Math.round(suitabilityScore)))

    // Dynamic Scientific Rationale
    let rationale = ''
    let pros: string[] = []
    let cons: string[] = []

    if (pathwayId === 'biochar') {
      if (moisture <= 25) {
        rationale = `Low moisture (${moisture}%) and dense carbon structure enable auto-thermal pyrolysis at 650°C. 78% of carbon is permanently fixed for 100+ years.`
        pros = ['Maximum permanent carbon removal (+82t)', 'Highest market value per ton', 'Qualifies for Verra VM0044 credits']
        cons = ['Requires controlled pyrolysis reactor', 'Feedstock moisture must stay under 25%']
      } else {
        rationale = `High moisture (${moisture}%) requires thermal pre-drying before pyrolysis, incurring parasitic thermal energy penalties.`
        pros = ['Long-term soil carbon storage', 'High credit value once dry']
        cons = ['Drying energy penalty', 'Higher initial capex']
      }
    } else if (pathwayId === 'biogas') {
      rationale = `Rapid microbial anaerobic digestion produces combustible methane, directly substituting baseload fossil coal/gas on the regional grid.`
      pros = ['Continuous renewable baseload power', 'Treats high-moisture organic slurries well', 'Produces nutrient-rich bio-digestate']
      cons = ['Grid feed-in tariff dependencies', 'Lower carbon permanence duration (~10-15y)']
    } else if (pathwayId === 'biomethane') {
      rationale = `Upgrading raw biogas to 96%+ biomethane yields automotive Bio-CNG eligible for SATAT scheme pricing of ₹75/kg.`
      pros = ['Premium automotive fuel pricing', 'Highest direct cashflow per ton', 'Displaces diesel in commercial fleets']
      cons = ['Membrane gas scrubbing equipment required', 'Compression electricity consumption']
    } else {
      rationale = `Aerobic microbial windrows convert organic waste into humic soil conditioner with minimal operational complexity.`
      pros = ['Lowest capital expenditure setup', 'Locally usable on agricultural fields', 'Improves soil biodiversity']
      cons = ['Lowest carbon credit monetization', 'Respiration releases natural biogenic CO2']
    }

    // Carbon potential label
    let carbonPotential: 'Very High' | 'High' | 'Medium' | 'Moderate' = 'Medium'
    if (carbonRes.netCO2eBenefit >= quantityTons * 0.9) carbonPotential = 'Very High'
    else if (carbonRes.netCO2eBenefit >= quantityTons * 0.6) carbonPotential = 'High'
    else if (carbonRes.netCO2eBenefit >= quantityTons * 0.3) carbonPotential = 'Medium'
    else carbonPotential = 'Moderate'

    return {
      pathwayId,
      name:
        pathwayId === 'biochar'
          ? 'Slow Pyrolysis (Durable Biochar)'
          : pathwayId === 'biogas'
          ? 'Anaerobic Biomethanation (Grid Power)'
          : pathwayId === 'biomethane'
          ? 'Purified Biomethane (Bio-CNG Vehicle Fuel)'
          : 'Aerobic Composting (Humic Soil Carbon)',
      shortName:
        pathwayId === 'biochar'
          ? 'Biochar'
          : pathwayId === 'biogas'
          ? 'Biogas'
          : pathwayId === 'biomethane'
          ? 'Bio-CNG'
          : 'Compost',
      rank: 1, // Will be set after sorting
      matchConfidence: normalizedScore,
      isPrimary: false,
      carbonYieldTCO2e: carbonRes.netCO2eBenefit,
      carbonPotential,
      economicReturnINR: totalEconomicReturn,
      pricePerTonINR: effectivePricePerTon,
      permanenceRating: config.permanenceDesc,
      comparisonTags: config.tags,
      scientificRationale: rationale,
      recommendedEquipment: config.recommendedTech,
      marketCommodity: config.commodityLabel,
      pros,
      cons,
    }
  })

  // Sort descending by confidence score
  evaluatedRecommendations.sort((a, b) => b.matchConfidence - a.matchConfidence)

  // Assign ranks 1 to 4 and mark primary
  evaluatedRecommendations.forEach((rec, idx) => {
    rec.rank = (idx + 1) as 1 | 2 | 3 | 4
    rec.isPrimary = idx === 0
  })

  const primary = evaluatedRecommendations[0]

  // Identify standout pathways
  const highestCarbon = [...evaluatedRecommendations].sort((a, b) => b.carbonYieldTCO2e - a.carbonYieldTCO2e)[0].pathwayId
  const highestRevenue = [...evaluatedRecommendations].sort((a, b) => b.economicReturnINR - a.economicReturnINR)[0].pathwayId

  const aiSummary = `Based on a moisture profile of ${moisture}% and ${standardConfig.name.toLowerCase()} properties, the AI determined ${primary.shortName} as the optimal conversion fate (#1 Rank, ${primary.matchConfidence}% Match). It yields ${primary.carbonYieldTCO2e} tCO₂e net carbon mitigation and an estimated economic return of ₹${primary.economicReturnINR.toLocaleString('en-IN')}.`

  return {
    wasteType,
    feedstockName: standardConfig.name,
    quantityTons,
    moisturePercent: moisture,
    dryMatterTons,
    primaryRecommendation: primary,
    allRecommendations: evaluatedRecommendations,
    aiSummary,
    highestCarbonPathway: highestCarbon,
    highestRevenuePathway: highestRevenue,
  }
}
