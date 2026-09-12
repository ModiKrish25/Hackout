import type {
  User,
  WasteListing,
  Facility,
  Match,
  Route,
  CarbonRecord,
  GeneratorSummary,
  FacilitySummary,
  MunicipalSummary,
  MunicipalMapData,
} from '../types'

// Demo Users
export const DEMO_USERS: Record<string, User> = {
  generator: {
    id: 101,
    name: 'Aarav Sharma (GreenAgro Farms)',
    email: 'generator@ecotrace.com',
    role: 'generator',
    location_lat: 12.9352,
    location_lng: 77.6245,
    createdAt: '2026-01-15T08:00:00Z',
  },
  facility: {
    id: 201,
    name: 'Dr. Priya Nair (BioVeda Energy Plant)',
    email: 'facility@ecotrace.com',
    role: 'facility',
    location_lat: 12.9856,
    location_lng: 77.5833,
    createdAt: '2026-01-10T10:00:00Z',
  },
  municipality: {
    id: 301,
    name: 'Officer Rajesh Kumar (BBMP Sustainability Dept)',
    email: 'municipal@ecotrace.com',
    role: 'municipality',
    location_lat: 12.9716,
    location_lng: 77.5946,
    createdAt: '2026-01-05T09:00:00Z',
  },
}

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 201,
    userId: 201,
    name: 'BioVeda Energy Biomethanation Plant',
    facilityType: 'Anaerobic Digestion',
    acceptedWasteTypes: ['food', 'agricultural', 'manure'],
    weeklyCapacityTons: 150,
    currentUtilizationTons: 98.5,
    locationLat: 12.9856,
    locationLng: 77.5833,
    address: 'Rajajinagar Industrial Area, Bangalore',
  },
  {
    id: 202,
    userId: 202,
    name: 'GreenCarbon Composting & Pyrolysis Hub',
    facilityType: 'Composting & Biochar',
    acceptedWasteTypes: ['agricultural', 'industrial_organic'],
    weeklyCapacityTons: 200,
    currentUtilizationTons: 142.0,
    locationLat: 12.9121,
    locationLng: 77.6446,
    address: 'HSR Sector 2 Circular Park, Bangalore',
  },
  {
    id: 203,
    userId: 203,
    name: 'MetroBio Gasification Station',
    facilityType: 'Thermal Gasification',
    acceptedWasteTypes: ['food', 'industrial_organic'],
    weeklyCapacityTons: 100,
    currentUtilizationTons: 64.2,
    locationLat: 13.0358,
    locationLng: 77.597,
    address: 'Hebbal Eco-Corridor, Bangalore',
  },
]

export const INITIAL_LISTINGS: WasteListing[] = [
  {
    id: 1,
    generatorId: 101,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    wasteType: 'agricultural',
    quantityTons: 14.5,
    moistureContent: 22,
    availableFrom: '2026-09-10',
    availableTo: '2026-09-18',
    locationLat: 12.9352,
    locationLng: 77.6245,
    address: 'Koramangala 4th Block, Agro Produce Hub',
    status: 'listed',
    createdAt: '2026-09-10T09:30:00Z',
  },
  {
    id: 2,
    generatorId: 101,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    wasteType: 'food',
    quantityTons: 8.2,
    moistureContent: 68,
    availableFrom: '2026-09-11',
    availableTo: '2026-09-16',
    locationLat: 12.9421,
    locationLng: 77.6189,
    address: 'Dairy Circle Commercial District',
    status: 'matched',
    matchedFacilityId: 201,
    matchedFacilityName: 'BioVeda Energy Biomethanation Plant',
    matchId: 11,
    createdAt: '2026-09-11T08:15:00Z',
  },
  {
    id: 3,
    generatorId: 101,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    wasteType: 'manure',
    quantityTons: 18.0,
    moistureContent: 45,
    availableFrom: '2026-09-08',
    availableTo: '2026-09-14',
    locationLat: 12.9298,
    locationLng: 77.6321,
    address: 'Ejipura Dairy Cooperative Yard',
    status: 'scheduled',
    matchedFacilityId: 201,
    matchedFacilityName: 'BioVeda Energy Biomethanation Plant',
    matchId: 12,
    createdAt: '2026-09-08T11:00:00Z',
  },
  {
    id: 4,
    generatorId: 101,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    wasteType: 'food',
    quantityTons: 12.0,
    moistureContent: 60,
    availableFrom: '2026-09-05',
    availableTo: '2026-09-10',
    locationLat: 12.9512,
    locationLng: 77.6045,
    address: 'Adugodi Wholesale Fruit Market',
    status: 'collected',
    matchedFacilityId: 201,
    matchedFacilityName: 'BioVeda Energy Biomethanation Plant',
    matchId: 13,
    createdAt: '2026-09-05T07:45:00Z',
  },
  {
    id: 5,
    generatorId: 101,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    wasteType: 'agricultural',
    quantityTons: 25.0,
    moistureContent: 18,
    availableFrom: '2026-09-01',
    availableTo: '2026-09-06',
    locationLat: 12.9189,
    locationLng: 77.6102,
    address: 'BTM 1st Stage Urban Farming Collective',
    status: 'processed',
    matchedFacilityId: 202,
    matchedFacilityName: 'GreenCarbon Composting & Pyrolysis Hub',
    matchId: 14,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 6,
    generatorId: 102,
    generatorName: 'Cauvery Food Processing Unit',
    wasteType: 'industrial_organic',
    quantityTons: 16.4,
    moistureContent: 52,
    availableFrom: '2026-09-12',
    availableTo: '2026-09-19',
    locationLat: 12.9689,
    locationLng: 77.5912,
    address: 'Shanti Nagar Industrial Cluster',
    status: 'listed',
    createdAt: '2026-09-12T06:30:00Z',
  },
]

export const INITIAL_MATCHES: Match[] = [
  {
    id: 11,
    listingId: 2,
    facilityId: 201,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    facilityName: 'BioVeda Energy Biomethanation Plant',
    wasteType: 'food',
    quantityTons: 8.2,
    distanceKm: 6.4,
    matchScore: 94.5,
    status: 'pending',
    createdAt: '2026-09-11T09:00:00Z',
  },
  {
    id: 12,
    listingId: 3,
    facilityId: 201,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    facilityName: 'BioVeda Energy Biomethanation Plant',
    wasteType: 'manure',
    quantityTons: 18.0,
    distanceKm: 8.2,
    matchScore: 91.2,
    status: 'scheduled',
    scheduledDate: '2026-09-13',
    createdAt: '2026-09-09T10:00:00Z',
  },
  {
    id: 13,
    listingId: 4,
    facilityId: 201,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    facilityName: 'BioVeda Energy Biomethanation Plant',
    wasteType: 'food',
    quantityTons: 12.0,
    distanceKm: 5.1,
    matchScore: 96.0,
    status: 'collected',
    createdAt: '2026-09-06T12:00:00Z',
  },
  {
    id: 14,
    listingId: 5,
    facilityId: 202,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    facilityName: 'GreenCarbon Composting & Pyrolysis Hub',
    wasteType: 'agricultural',
    quantityTons: 25.0,
    distanceKm: 4.8,
    matchScore: 98.2,
    status: 'processed',
    createdAt: '2026-09-02T14:30:00Z',
  },
]

export const INITIAL_ROUTE: Route = {
  id: 1,
  facilityId: 201,
  collectionDate: new Date().toISOString().split('T')[0],
  totalDistanceKm: 28.4,
  estimatedDurationMinutes: 85,
  totalQuantityTons: 38.2,
  status: 'planned',
  stops: [
    {
      stopNumber: 1,
      listingId: 2,
      generatorName: 'Aarav Sharma (GreenAgro Farms)',
      quantityTons: 8.2,
      wasteType: 'food',
      locationLat: 12.9421,
      locationLng: 77.6189,
      address: 'Dairy Circle Commercial District',
      estimatedArrival: '09:30 AM',
    },
    {
      stopNumber: 2,
      listingId: 3,
      generatorName: 'Ejipura Dairy Cooperative Yard',
      quantityTons: 18.0,
      wasteType: 'manure',
      locationLat: 12.9298,
      locationLng: 77.6321,
      address: 'Ejipura Dairy Cooperative Yard',
      estimatedArrival: '10:45 AM',
    },
    {
      stopNumber: 3,
      listingId: 4,
      generatorName: 'Adugodi Wholesale Fruit Market',
      quantityTons: 12.0,
      wasteType: 'food',
      locationLat: 12.9512,
      locationLng: 77.6045,
      address: 'Adugodi Wholesale Fruit Market',
      estimatedArrival: '11:50 AM',
    },
  ],
  polylineCoordinates: [
    [12.9856, 77.5833], // Facility Depot (Rajajinagar)
    [12.9689, 77.5912],
    [12.9512, 77.6045], // Stop 3
    [12.9421, 77.6189], // Stop 1
    [12.9298, 77.6321], // Stop 2
    [12.9856, 77.5833], // Return to Depot
  ],
}

export const INITIAL_CARBON_RECORDS: CarbonRecord[] = [
  {
    id: 501,
    matchId: 14,
    generatorId: 101,
    facilityId: 202,
    generatorName: 'Aarav Sharma (GreenAgro Farms)',
    facilityName: 'GreenCarbon Composting & Pyrolysis Hub',
    wasteType: 'agricultural',
    quantityTons: 25.0,
    co2SequesteredTons: 38.5,
    landfillMethaneBaselineTons: 47.2,
    netCarbonBenefitTons: 35.8,
    conversionPathway: 'Pyrolysis Biochar',
    processedDate: '2026-09-06',
  },
  {
    id: 502,
    matchId: 9,
    generatorId: 102,
    facilityId: 201,
    generatorName: 'Cauvery Food Processing Unit',
    facilityName: 'BioVeda Energy Biomethanation Plant',
    wasteType: 'food',
    quantityTons: 32.0,
    co2SequesteredTons: 44.8,
    landfillMethaneBaselineTons: 58.4,
    netCarbonBenefitTons: 41.2,
    conversionPathway: 'Biomethanation & Power Grid Injection',
    processedDate: '2026-09-04',
  },
  {
    id: 503,
    matchId: 8,
    generatorId: 103,
    facilityId: 203,
    generatorName: 'Mysore Agri Produce Consortium',
    facilityName: 'MetroBio Gasification Station',
    wasteType: 'manure',
    quantityTons: 40.0,
    co2SequesteredTons: 62.0,
    landfillMethaneBaselineTons: 81.0,
    netCarbonBenefitTons: 59.4,
    conversionPathway: 'Thermophilic Digestion',
    processedDate: '2026-08-28',
  },
]

// Mock LocalStorage Database Store
class MockDbStore {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`ecotrace_${key}`)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`ecotrace_${key}`, JSON.stringify(value))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }

  getListings(): WasteListing[] {
    return this.getStorage<WasteListing[]>('listings', INITIAL_LISTINGS)
  }

  saveListing(listing: Omit<WasteListing, 'id' | 'createdAt' | 'status'>): WasteListing {
    const listings = this.getListings()
    const newListing: WasteListing = {
      ...listing,
      id: Date.now(),
      status: 'listed',
      createdAt: new Date().toISOString(),
    }
    listings.unshift(newListing)
    this.setStorage('listings', listings)
    return newListing
  }

  cancelListing(id: number): boolean {
    const listings = this.getListings()
    const index = listings.findIndex((l) => l.id === id)
    if (index !== -1 && listings[index].status === 'listed') {
      listings.splice(index, 1)
      this.setStorage('listings', listings)
      return true
    }
    return false
  }

  getFacilities(): Facility[] {
    return this.getStorage<Facility[]>('facilities', INITIAL_FACILITIES)
  }

  updateFacility(id: number, data: Partial<Facility>): Facility | null {
    const facilities = this.getFacilities()
    const index = facilities.findIndex((f) => f.id === id)
    if (index !== -1) {
      facilities[index] = { ...facilities[index], ...data }
      this.setStorage('facilities', facilities)
      return facilities[index]
    }
    return null
  }

  getMatches(facilityId?: number, status?: string): Match[] {
    let matches = this.getStorage<Match[]>('matches', INITIAL_MATCHES)
    if (facilityId) matches = matches.filter((m) => m.facilityId === facilityId)
    if (status) matches = matches.filter((m) => m.status === status)
    return matches
  }

  updateMatchStatus(id: number, status: 'confirmed' | 'rejected' | 'scheduled' | 'collected' | 'processed'): Match | null {
    const matches = this.getStorage<Match[]>('matches', INITIAL_MATCHES)
    const match = matches.find((m) => m.id === id)
    if (match) {
      match.status = status
      this.setStorage('matches', matches)

      // Also update linked listing status
      const listings = this.getListings()
      const listing = listings.find((l) => l.id === match.listingId)
      if (listing) {
        listing.status = status === 'confirmed' ? 'matched' : status === 'rejected' ? 'listed' : status
        this.setStorage('listings', listings)
      }
      return match
    }
    return null
  }

  getRoute(facilityId: number, date: string): Route | null {
    const routes = this.getStorage<Record<string, Route>>('routes', {
      [`${INITIAL_ROUTE.facilityId}_${INITIAL_ROUTE.collectionDate}`]: INITIAL_ROUTE,
    })
    return routes[`${facilityId}_${date}`] || null
  }

  generateRoute(facilityId: number, date: string): Route {
    const routes = this.getStorage<Record<string, Route>>('routes', {})
    const key = `${facilityId}_${date}`
    const newRoute: Route = {
      ...INITIAL_ROUTE,
      id: Date.now(),
      facilityId,
      collectionDate: date,
      status: 'planned',
    }
    routes[key] = newRoute
    this.setStorage('routes', routes)
    return newRoute
  }

  getCarbonRecords(filters?: { wasteType?: string; startDate?: string; endDate?: string }): CarbonRecord[] {
    let records = this.getStorage<CarbonRecord[]>('carbon_records', INITIAL_CARBON_RECORDS)
    if (filters?.wasteType && filters.wasteType !== 'all') {
      records = records.filter((r) => r.wasteType === filters.wasteType)
    }
    return records
  }

  getGeneratorSummary(generatorId: number): GeneratorSummary {
    const listings = this.getListings().filter((l) => l.generatorId === generatorId)
    const tonsDiverted = listings
      .filter((l) => l.status === 'collected' || l.status === 'processed')
      .reduce((sum, l) => sum + l.quantityTons, 65.4)
    return {
      activeListingsCount: listings.filter((l) => l.status === 'listed' || l.status === 'matched').length,
      tonsDivertedAllTime: Number(tonsDiverted.toFixed(1)),
      revenueEarned: Math.round(tonsDiverted * 42.5),
      co2CreditsEarned: Math.round(tonsDiverted * 1.45 * 10) / 10,
    }
  }

  getFacilitySummary(facilityId: number): FacilitySummary {
    const facility = this.getFacilities().find((f) => f.id === facilityId) || INITIAL_FACILITIES[0]
    const pendingCount = this.getMatches(facilityId, 'pending').length
    return {
      capacityUtilizationPercent: Math.round((facility.currentUtilizationTons / facility.weeklyCapacityTons) * 100),
      pendingMatchesCount: pendingCount,
      tonsProcessedAllTime: 438.5,
      co2SequesteredAllTime: 612.4,
      weeklyCapacityTons: facility.weeklyCapacityTons,
      currentUtilizationTons: facility.currentUtilizationTons,
    }
  }

  getMunicipalSummary(): MunicipalSummary {
    const listings = this.getListings()
    const carbonRecords = this.getCarbonRecords()
    const totalTonsDiverted = carbonRecords.reduce((sum, r) => sum + r.quantityTons, 845.2)
    const totalCo2 = carbonRecords.reduce((sum, r) => sum + r.co2SequesteredTons, 1184.6)
    return {
      totalTonsDiverted: Number(totalTonsDiverted.toFixed(1)),
      totalCo2SequesteredTons: Number(totalCo2.toFixed(1)),
      totalFacilitiesActive: this.getFacilities().length,
      totalGeneratorsParticipating: 48,
      carsOffTheRoadEquivalent: Math.round(totalCo2 / 4.6), // EPA factor: 4.6 metric tons CO2 / typical car / year
      matchesByStatus: [
        { status: 'Pending', count: listings.filter((l) => l.status === 'listed').length + 3 },
        { status: 'Matched', count: listings.filter((l) => l.status === 'matched').length + 5 },
        { status: 'Scheduled', count: listings.filter((l) => l.status === 'scheduled').length + 8 },
        { status: 'Collected', count: listings.filter((l) => l.status === 'collected').length + 12 },
        { status: 'Processed', count: listings.filter((l) => l.status === 'processed').length + 26 },
      ],
    }
  }

  getMunicipalMapData(): MunicipalMapData {
    const facilities = this.getFacilities()
    const listings = this.getListings()
    const heatPoints: [number, number, number][] = listings.map((l) => [
      l.locationLat,
      l.locationLng,
      Math.min(1.0, Math.max(0.3, l.quantityTons / 30)),
    ])
    return {
      facilities,
      listings,
      heatPoints,
    }
  }
}

export const mockDb = new MockDbStore()
