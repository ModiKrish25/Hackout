import { apiClient } from './apiClient'
import type { Match, MatchCandidate } from '../types'

export interface CreateMatchPayload {
  listingId: number
  facilityId: number
  matchedQuantityTons: number
  matchScore?: number
}

const normalizeMatch = (m: any): Match => ({
  id: m.id,
  listingId: m.listingId,
  facilityId: m.facilityId,
  wasteType: m.listing?.wasteType || m.wasteType || 'food',
  quantityTons: Number(m.matchedQuantityTons || m.listing?.quantityTons || m.quantityTons || 0),
  generatorName: m.listing?.generator?.name || m.generatorName || (m.listing?.generatorId ? `Generator #${m.listing.generatorId}` : 'Organic Producer'),
  facilityName: m.facility?.name || m.facility?.operator?.name || m.facilityName || 'Bio-Conversion Facility',
  matchScore: m.matchScore ? Number(m.matchScore) : 92,
  distanceKm: m.distanceKm ? Number(m.distanceKm) : 14.5,
  status: m.status,
  createdAt: m.createdAt,
  address: m.listing?.address || 'Bengaluru Peri-Urban Agricultural Zone',
})

export const matchingService = {
  async findCandidates(listingId: number): Promise<MatchCandidate[]> {
    const res = (await apiClient.post(`/matches/find-candidates/${listingId}`)) as any
    return res as MatchCandidate[]
  },

  async createMatch(payload: CreateMatchPayload): Promise<Match> {
    const res = (await apiClient.post('/matches', payload)) as any
    return normalizeMatch(res)
  },

  async confirmMatch(id: number): Promise<Match> {
    const res = (await apiClient.patch(`/matches/${id}/confirm`)) as any
    return normalizeMatch(res)
  },

  async collectMatch(id: number): Promise<Match> {
    const res = (await apiClient.patch(`/matches/${id}/collect`)) as any
    return normalizeMatch(res)
  },

  async rejectMatch(id: number): Promise<{ message: string }> {
    const res = (await apiClient.patch(`/matches/${id}/reject`)) as any
    return res
  },

  async processMatch(id: number): Promise<{ match: Match; carbonRecord: any }> {
    const res = (await apiClient.patch(`/matches/${id}/process`)) as any
    return {
      match: normalizeMatch(res.match || res),
      carbonRecord: res.carbonRecord,
    }
  },

  async getAllMatches(params?: { facilityId?: number; listingId?: number; status?: string }): Promise<Match[]> {
    const res = (await apiClient.get('/matches', { params })) as any
    if (!Array.isArray(res)) return []
    return res.map(normalizeMatch)
  },

  async getMatchById(id: number): Promise<Match> {
    const res = (await apiClient.get(`/matches/${id}`)) as any
    return normalizeMatch(res)
  },
}

export default matchingService
