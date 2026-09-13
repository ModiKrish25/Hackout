/**
 * City & Landmark Geocoding Utility
 * Provides instant local coordinate lookup and OpenStreetMap Nominatim live geocoding.
 */

// Instant fallback dictionary for rapid Indian & international cities / hubs
const CITY_COORDINATES_MAP: Record<string, [number, number]> = {
  ahmedabad: [23.0225, 72.5714],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  'new delhi': [28.6139, 77.209],
  hyderabad: [17.385, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  jaipur: [26.9124, 75.7873],
  surat: [21.1702, 72.8311],
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  nagpur: [21.1458, 79.0882],
  indore: [22.7196, 75.8577],
  thane: [19.2183, 72.9781],
  bhopal: [23.2599, 77.4126],
  visakhapatnam: [17.6868, 83.2185],
  vadodara: [22.3072, 73.1812],
  ghaziabad: [28.6692, 77.4538],
  ludhiana: [30.901, 75.8573],
  agra: [27.1767, 78.0081],
  nashik: [19.9975, 73.7898],
  faridabad: [28.4089, 77.3178],
  meerut: [28.9845, 77.7064],
  rajkot: [22.3039, 70.8022],
  varanasi: [25.3176, 82.9739],
  srinagar: [34.0837, 74.7973],
  aurangabad: [19.8762, 75.3433],
  dhanbad: [23.7957, 86.4304],
  amritsar: [31.634, 74.8723],
  'navi mumbai': [19.033, 73.0297],
  prayagraj: [25.4358, 81.8463],
  allahabad: [25.4358, 81.8463],
  ranchi: [23.3441, 85.3096],
  howrah: [22.5958, 88.2636],
  coimbatore: [11.0168, 76.9558],
  jabalpur: [23.1815, 79.9864],
  gwalior: [26.2183, 78.1828],
  vijayawada: [16.5062, 80.648],
  jodhpur: [26.2389, 73.0243],
  madurai: [9.9252, 78.1198],
  raipur: [21.2514, 81.6296],
  kota: [25.2138, 75.8648],
  chandigarh: [30.7333, 76.7794],
  guwahati: [26.1445, 91.7362],
  solapur: [17.6599, 75.9064],
  hubli: [15.3647, 75.124],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
  tiruchirappalli: [10.7905, 78.7047],
  bareilly: [28.367, 79.4304],
  aligarh: [27.8974, 78.088],
  tiruppur: [11.1085, 77.3411],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  noida: [28.5355, 77.391],
  kochi: [9.9312, 76.2673],
  cochin: [9.9312, 76.2673],
  thiruvananthapuram: [8.5241, 76.9366],
  trivandrum: [8.5241, 76.9366],
  kozhikode: [11.2588, 75.7804],
  calicut: [11.2588, 75.7804],
  dehradun: [30.3165, 78.0322],
  mangalore: [12.9141, 74.856],
  mangaluru: [12.9141, 74.856],
  // Major Bangalore Localities
  koramangala: [12.9352, 77.6245],
  indiranagar: [12.9784, 77.6408],
  whitefield: [12.9698, 77.75],
  yelahanka: [13.1007, 77.5963],
  peenya: [13.0285, 77.5197],
  jayanagar: [12.9308, 77.5838],
  hebbal: [13.0358, 77.597],
  electroniccity: [12.8452, 77.6602],
  'electronic city': [12.8452, 77.6602],
  rajajinagar: [12.9982, 77.553],
  malleshwaram: [13.0012, 77.5689],
}

/**
 * Geocodes an address string to [latitude, longitude]
 */
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; displayName?: string } | null> {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed || trimmed.length < 2) return null

  // 1. Direct dictionary match
  for (const [key, coords] of Object.entries(CITY_COORDINATES_MAP)) {
    if (trimmed === key || trimmed.includes(key) || key.includes(trimmed)) {
      return { lat: coords[0], lng: coords[1], displayName: key }
    }
  }

  // 2. OpenStreetMap Nominatim Live Geocoding API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, displayName: data[0].display_name }
      }
    }
  } catch (err) {
    // Network or CORS error fallback
  }

  return null
}
