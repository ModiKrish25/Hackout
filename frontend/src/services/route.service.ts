import { apiClient } from './apiClient'
import type { Route } from '../types'

export interface GenerateRoutePayload {
  facilityId: number
  collectionDate: string
}

export const routeService = {
  async generateRoute(payload: GenerateRoutePayload): Promise<Route> {
    const res = (await apiClient.post('/routes/generate', payload)) as any
    return res as Route
  },

  async getRouteByFacilityAndDate(facilityId: number, date: string): Promise<Route> {
    const res = (await apiClient.get(`/routes/${facilityId}/${date}`)) as any
    return res as Route
  },

  async getAllRoutes(): Promise<Route[]> {
    const res = (await apiClient.get('/routes')) as any
    return res as Route[]
  },

  async getRouteById(id: number): Promise<Route> {
    const res = (await apiClient.get(`/routes/${id}`)) as any
    return res as Route
  },
}

export default routeService
