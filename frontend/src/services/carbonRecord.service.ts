import { apiClient } from './apiClient'
import type { CarbonRecord } from '../types'

export interface CarbonSummaryResponse {
  totalProcessedTonnage: number
  totalCo2SequesteredTons: number
  totalAvoidedLandfillTons: number
  totalNetCarbonBenefitTons: number
  byConversionPathway: Record<string, number>
}

export const carbonRecordService = {
  async getSummary(): Promise<CarbonSummaryResponse> {
    const res = (await apiClient.get('/carbon-records/summary')) as any
    return res as CarbonSummaryResponse
  },

  async getByMatchId(matchId: number): Promise<CarbonRecord> {
    const res = (await apiClient.get(`/carbon-records/${matchId}`)) as any
    return res as CarbonRecord
  },

  async getAll(params?: {
    generatorId?: number
    matchId?: number
    wasteType?: string
    conversionPathway?: string
  }): Promise<CarbonRecord[]> {
    const res = (await apiClient.get('/carbon-records', { params })) as any
    return res as CarbonRecord[]
  },
}

export default carbonRecordService
