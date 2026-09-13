import { apiClient } from './apiClient'

export interface MunicipalSummaryResponse {
  totalListings: number
  totalFacilities: number
  totalTonsProcessed: number
  totalCo2SequesteredTons: number
  totalNetCarbonBenefitTons: number
  matchesByStatus: {
    pending: number
    scheduled: number
    collected: number
    processed: number
  }
}

export interface GeneratorSummaryResponse {
  generatorId: number
  generatorName: string
  totalListings: number
  activeListingsCount?: number
  totalTonsListed: number
  totalTonsDiverted: number
  totalCo2CreditEarnedTons: number
  totalNetCarbonBenefitTons: number
  listingsByStatus: Record<string, number>
}

export interface FacilitySummaryResponse {
  facilityId: number
  facilityType: string
  capacityTonsPerWeek: number
  currentUtilization: number
  utilizationPercentage: number
  remainingCapacityTonsPerWeek: number
  matchesByStatus: Record<string, number>
  totalTonsProcessed: number
  totalNetCarbonGeneratedTons: number
}

export interface MunicipalMapDataResponse {
  listings: Array<{
    id: number
    generatorId: number
    generatorName: string
    wasteType: string
    quantityTons: number
    moistureContent: number | null
    locationLat: number
    locationLng: number
    status: string
    availableFrom: string
    availableTo: string
  }>
  facilities: Array<{
    id: number
    operatorId: number
    operatorName: string
    facilityType: string
    acceptedWasteTypes: string[]
    capacityTonsPerWeek: number
    currentUtilization: number
    utilizationPercentage: number
    locationLat: number
    locationLng: number
  }>
}

export const dashboardService = {
  async getMunicipalSummary(): Promise<MunicipalSummaryResponse> {
    const res = (await apiClient.get('/dashboard/municipal/summary')) as any
    return res as MunicipalSummaryResponse
  },

  async getMunicipalMapData(): Promise<MunicipalMapDataResponse> {
    const res = (await apiClient.get('/dashboard/municipal/map-data')) as any
    return res as MunicipalMapDataResponse
  },

  async getGeneratorSummary(generatorId: number): Promise<GeneratorSummaryResponse> {
    const res = (await apiClient.get(`/dashboard/generator/${generatorId}/summary`)) as any
    return res as GeneratorSummaryResponse
  },

  async getFacilitySummary(facilityId: number): Promise<FacilitySummaryResponse> {
    const res = (await apiClient.get(`/dashboard/facility/${facilityId}/summary`)) as any
    return res as FacilitySummaryResponse
  },
}

export default dashboardService
