import { apiClient } from './apiClient'
import type { WasteListing, WasteType } from '../types'

export interface CreateListingPayload {
  wasteType: WasteType
  quantityTons: number
  moistureContent?: number
  availableFrom: string
  availableTo: string
  locationLat: number
  locationLng: number
  address?: string
}

export const wasteListingService = {
  async getAllListings(params?: {
    generatorId?: number
    status?: string
    wasteType?: string
    nearLat?: number
    nearLng?: number
    radiusKm?: number
  }): Promise<WasteListing[]> {
    const res = (await apiClient.get('/waste-listings', { params })) as any
    return res as WasteListing[]
  },

  async getListingById(id: number): Promise<WasteListing> {
    const res = (await apiClient.get(`/waste-listings/${id}`)) as any
    return res as WasteListing
  },

  async createListing(payload: CreateListingPayload): Promise<WasteListing> {
    const res = (await apiClient.post('/waste-listings', payload)) as any
    return res as WasteListing
  },

  async updateListing(id: number, payload: Partial<CreateListingPayload>): Promise<WasteListing> {
    const res = (await apiClient.patch(`/waste-listings/${id}`, payload)) as any
    return res as WasteListing
  },

  async cancelListing(id: number): Promise<{ message: string }> {
    const res = (await apiClient.delete(`/waste-listings/${id}`)) as any
    return res
  },
}

export default wasteListingService
