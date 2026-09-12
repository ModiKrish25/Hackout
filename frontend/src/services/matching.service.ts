import { apiClient } from './apiClient'
import type { Match, MatchCandidate } from '../types'

export interface CreateMatchPayload {
  listingId: number
  facilityId: number
  matchedQuantityTons: number
  matchScore?: number
}

export const matchingService = {
  async findCandidates(listingId: number): Promise<MatchCandidate[]> {
    const res = (await apiClient.post(`/matches/find-candidates/${listingId}`)) as any
    return res as MatchCandidate[]
  },

  async createMatch(payload: CreateMatchPayload): Promise<Match> {
    const res = (await apiClient.post('/matches', payload)) as any
    return res as Match
  },

  async confirmMatch(id: number): Promise<Match> {
    const res = (await apiClient.patch(`/matches/${id}/confirm`)) as any
    return res as Match
  },

  async rejectMatch(id: number): Promise<{ message: string }> {
    const res = (await apiClient.patch(`/matches/${id}/reject`)) as any
    return res
  },

  async processMatch(id: number): Promise<{ match: Match; carbonRecord: any }> {
    const res = (await apiClient.patch(`/matches/${id}/process`)) as any
    return res
  },

  async getAllMatches(params?: { facilityId?: number; listingId?: number; status?: string }): Promise<Match[]> {
    const res = (await apiClient.get('/matches', { params })) as any
    return res as Match[]
  },

  async getMatchById(id: number): Promise<Match> {
    const res = (await apiClient.get(`/matches/${id}`)) as any
    return res as Match
  },
}

export default matchingService
