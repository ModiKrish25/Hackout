import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { mockDb, DEMO_USERS } from './mockData'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const storedTokens = localStorage.getItem('ecotrace_tokens')
      if (storedTokens) {
        const { accessToken } = JSON.parse(storedTokens)
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      }
    } catch {
      // Ignore token read error
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Unwrap NestJS { statusCode, message, data }
api.interceptors.response.use(
  (response) => {
    // If NestJS ResponseInterceptor format is present
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data
    }
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config
    const url = originalRequest?.url || ''
    const method = originalRequest?.method?.toLowerCase() || 'get'

    // Check if network error (backend not running or connection refused) or 404
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED'
    const isNotFound = error.response?.status === 404

    if (isNetworkError || isNotFound) {
      console.info(`[EcoTrace Hybrid Adapter] Live API unavailable. Handling via MockDB: ${method.toUpperCase()} ${url}`)
      return handleMockFallback(method, url, originalRequest?.data)
    }

    return Promise.reject(error)
  }
)

// Automatic Mock Adapter Fallback Dispatcher
function handleMockFallback(method: string, url: string, rawBody?: unknown) {
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody

  // Auth Endpoints
  if (url.includes('/auth/login')) {
    let user = null
    try {
      const regList = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]')
      user = regList.find((u: any) => u.email?.toLowerCase() === body?.email?.toLowerCase())
    } catch {
      // ignore
    }

    if (!user) {
      const role = body?.email?.includes('facility')
        ? 'facility'
        : body?.email?.includes('municipal')
        ? 'municipality'
        : 'generator'
      user = DEMO_USERS[role] || DEMO_USERS.generator
    }

    return {
      user,
      tokens: {
        accessToken: `mock_access_${user.role}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.role}_${Date.now()}`,
      },
    }
  }

  if (url.includes('/auth/register')) {
    const role = body?.role || 'generator'
    const user = {
      id: Date.now(),
      name: body?.name || 'Registered User',
      email: body?.email || 'user@ecotrace.com',
      role,
      location_lat: body?.location_lat || 12.9716,
      location_lng: body?.location_lng || 77.5946,
      state: body?.state || 'Karnataka',
      city: body?.city || 'Bengaluru',
    }

    try {
      const regList = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]')
      regList.push(user)
      localStorage.setItem('ecotrace_registered_users', JSON.stringify(regList))
    } catch {
      // ignore
    }

    return {
      user,
      tokens: {
        accessToken: `mock_access_${role}_${Date.now()}`,
        refreshToken: `mock_refresh_${role}_${Date.now()}`,
      },
    }
  }

  // Dashboard Summaries
  if (url.includes('/dashboard/generator')) {
    return mockDb.getGeneratorSummary(101)
  }
  if (url.includes('/dashboard/facility')) {
    return mockDb.getFacilitySummary(201)
  }
  if (url.includes('/dashboard/municipal/summary')) {
    return mockDb.getMunicipalSummary()
  }
  if (url.includes('/dashboard/municipal/map-data')) {
    return mockDb.getMunicipalMapData()
  }

  // Waste Listings
  if (url.startsWith('/waste-listings') || url.includes('/waste-listings')) {
    if (method === 'post') {
      return mockDb.saveListing(body)
    }
    if (method === 'delete') {
      const parts = url.split('/')
      const id = Number(parts[parts.length - 1])
      return { success: mockDb.cancelListing(id) }
    }
    if (method === 'get') {
      const parts = url.split('/')
      const lastPart = parts[parts.length - 1]
      const id = Number(lastPart)
      if (!isNaN(id)) {
        const listing = mockDb.getListings().find((l) => l.id === id)
        return listing || mockDb.getListings()[0]
      }
      return mockDb.getListings()
    }
  }

  // Matches
  if (url.includes('/matches')) {
    if (url.includes('/confirm')) {
      const id = Number(url.split('/')[2])
      return mockDb.updateMatchStatus(id, 'confirmed')
    }
    if (url.includes('/reject')) {
      const id = Number(url.split('/')[2])
      return mockDb.updateMatchStatus(id, 'rejected')
    }
    return mockDb.getMatches(201)
  }

  // Routes
  if (url.includes('/routes/generate')) {
    return mockDb.generateRoute(body?.facilityId || 201, body?.collectionDate || new Date().toISOString().split('T')[0])
  }
  if (url.includes('/routes')) {
    const parts = url.split('/')
    const facilityId = Number(parts[2]) || 201
    const date = parts[3] || new Date().toISOString().split('T')[0]
    return mockDb.getRoute(facilityId, date) || mockDb.generateRoute(facilityId, date)
  }

  // Facilities
  if (url.includes('/facilities')) {
    if (method === 'patch') {
      const parts = url.split('/')
      const id = Number(parts[parts.length - 1])
      return mockDb.updateFacility(id, body)
    }
    return mockDb.getFacilities()[0]
  }

  // Carbon Records
  if (url.includes('/carbon-records')) {
    return mockDb.getCarbonRecords()
  }

  return { success: true, message: 'Mock response' }
}

export default api
