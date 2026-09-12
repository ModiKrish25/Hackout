import { apiClient } from './apiClient'
import type { Facility } from '../types'

export const facilityService = {
  async getAllFacilities(): Promise<Facility[]> {
    const res = (await apiClient.get('/facilities')) as any
    return res as Facility[]
  },

  async getFacilityById(id: number): Promise<Facility> {
    const res = (await apiClient.get(`/facilities/${id}`)) as any
    return res as Facility
  },

  async updateFacility(id: number, data: Partial<Facility>): Promise<Facility> {
    const res = (await apiClient.patch(`/facilities/${id}`, data)) as any
    return res as Facility
  },
}

export default facilityService
