import { apiClient } from './apiClient'
import type { Route } from '../types'

export interface GenerateRoutePayload {
  facilityId: number
  collectionDate: string
}

export const normalizeRoute = (raw: any): Route => {
  if (!raw) return raw
  if (Array.isArray(raw.stops) && raw.stops.length > 0 && typeof raw.totalDistanceKm === 'number' && raw.polylineCoordinates) {
    return raw as Route
  }

  const listings = raw.orderedListings || []
  const depotLat = Number(raw.facility?.locationLat || 13.0285)
  const depotLng = Number(raw.facility?.locationLng || 77.5197)

  let cumulativeMinutes = 30 // departure at 8:30 AM
  const stops = listings.map((l: any, idx: number) => {
    cumulativeMinutes += 25 // travel + loading
    const arrivalHour = 8 + Math.floor(cumulativeMinutes / 60)
    const arrivalMin = cumulativeMinutes % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    const timeStr = `${pad(arrivalHour)}:${pad(arrivalMin)} ${arrivalHour >= 12 ? 'PM' : 'AM'}`

    return {
      stopNumber: idx + 1,
      listingId: l.id,
      generatorName: l.generator?.name || l.generatorName || `Generator #${l.generatorId || idx + 1}`,
      quantityTons: Number(l.quantityTons || 10),
      wasteType: l.wasteType || 'agricultural',
      locationLat: Number(l.locationLat || 12.9716 + idx * 0.02),
      locationLng: Number(l.locationLng || 77.5946 + idx * 0.02),
      address: l.address || `${l.generator?.name || 'Farm Gate'}, Bengaluru Agro Zone`,
      estimatedArrival: timeStr,
    }
  })

  const totalQuantityTons = Number(
    stops.reduce((sum: number, s: any) => sum + Number(s.quantityTons || 0), 0).toFixed(1)
  )

  const totalDist = Number(Number(raw.totalDistanceKm || (stops.length * 9.5 + 12)).toFixed(1))
  const estimatedDurationMinutes = Math.round(totalDist * 2.2 + stops.length * 15)

  const polylineCoordinates: [number, number][] = [
    [depotLat, depotLng],
    ...stops.map((s: any) => [s.locationLat, s.locationLng] as [number, number]),
    [depotLat, depotLng],
  ]

  return {
    id: raw.id || 1,
    facilityId: raw.facilityId || raw.facility?.id || 10,
    collectionDate: raw.collectionDate || new Date().toISOString().split('T')[0],
    totalDistanceKm: totalDist,
    estimatedDurationMinutes,
    totalQuantityTons,
    status: (raw.status || 'planned') as 'planned' | 'in_progress' | 'completed',
    stops,
    polylineCoordinates,
  }
}

export const routeService = {
  async generateRoute(payload: GenerateRoutePayload): Promise<Route> {
    const res = (await apiClient.post('/routes/generate', payload)) as any
    return normalizeRoute(res)
  },

  async getRouteByFacilityAndDate(facilityId: number, date: string): Promise<Route> {
    const res = (await apiClient.get(`/routes/${facilityId}/${date}`)) as any
    return normalizeRoute(res)
  },

  async getAllRoutes(): Promise<Route[]> {
    const res = (await apiClient.get('/routes')) as any
    return (Array.isArray(res) ? res : []).map(normalizeRoute)
  },

  async getRouteById(id: number): Promise<Route> {
    const res = (await apiClient.get(`/routes/${id}`)) as any
    return normalizeRoute(res)
  },
}

export default routeService
