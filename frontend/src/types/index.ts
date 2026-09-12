export type UserRole = 'generator' | 'facility' | 'municipality' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string
  locationLat?: number
  locationLng?: number
  location_lat?: number
  location_lng?: number
  state?: string
  city?: string
  createdAt?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: UserRole
  phone?: string
  locationLat?: number
  locationLng?: number
  location_lat?: number
  location_lng?: number
  state?: string
  city?: string
}

export type WasteType = 'food' | 'agricultural' | 'manure' | 'industrial_organic'

export type ListingStatus = 'listed' | 'matched' | 'scheduled' | 'collected' | 'processed'

export interface WasteListing {
  id: number
  generatorId: number
  generatorName?: string
  wasteType: WasteType
  quantityTons: number
  moistureContent?: number
  availableFrom: string
  availableTo: string
  locationLat: number
  locationLng: number
  address?: string
  status: ListingStatus
  matchedFacilityId?: number
  matchedFacilityName?: string
  matchId?: number
  createdAt: string
}

export interface Facility {
  id: number
  userId: number
  name: string
  facilityType: string
  acceptedWasteTypes: WasteType[]
  weeklyCapacityTons: number
  currentUtilizationTons: number
  locationLat: number
  locationLng: number
  address?: string
}

export type MatchStatus = 'pending' | 'confirmed' | 'scheduled' | 'collected' | 'processed' | 'rejected'

export interface Match {
  id: number
  listingId: number
  facilityId: number
  generatorName?: string
  facilityName?: string
  wasteType: WasteType
  quantityTons: number
  distanceKm: number
  matchScore: number
  status: MatchStatus
  scheduledDate?: string
  listing?: WasteListing
  facility?: Facility
  createdAt: string
}

export interface MatchCandidate {
  facilityId: number
  facilityName: string
  distanceKm: number
  score: number
  remainingCapacityTons?: number
  capacityRatio?: number
}

export interface RouteStop {
  stopNumber: number
  listingId: number
  generatorName: string
  quantityTons: number
  wasteType: WasteType
  locationLat: number
  locationLng: number
  address: string
  estimatedArrival?: string
}

export interface Route {
  id: number
  facilityId: number
  collectionDate: string
  totalDistanceKm: number
  estimatedDurationMinutes: number
  totalQuantityTons: number
  status: 'planned' | 'in_progress' | 'completed'
  stops: RouteStop[]
  polylineCoordinates: [number, number][]
}

export interface CarbonRecord {
  id: number
  matchId: number
  generatorId: number
  facilityId: number
  generatorName: string
  facilityName: string
  wasteType: WasteType
  quantityTons: number
  co2SequesteredTons: number
  landfillMethaneBaselineTons: number
  netCarbonBenefitTons: number
  conversionPathway: string
  processedDate: string
}

export interface GeneratorSummary {
  activeListingsCount: number
  tonsDivertedAllTime: number
  revenueEarned: number
  co2CreditsEarned: number
}

export interface FacilitySummary {
  capacityUtilizationPercent: number
  pendingMatchesCount: number
  tonsProcessedAllTime: number
  co2SequesteredAllTime: number
  weeklyCapacityTons: number
  currentUtilizationTons: number
}

export interface MunicipalSummary {
  totalTonsDiverted: number
  totalCo2SequesteredTons: number
  totalFacilitiesActive: number
  totalGeneratorsParticipating: number
  carsOffTheRoadEquivalent: number
  matchesByStatus: { status: string; count: number }[]
}

export interface MunicipalMapData {
  facilities: Facility[]
  listings: WasteListing[]
  heatPoints: [number, number, number][] // [lat, lng, intensity]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}
