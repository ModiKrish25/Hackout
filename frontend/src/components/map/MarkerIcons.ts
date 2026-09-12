import L from 'leaflet'

/**
 * Custom SVG DivIcon for Processing Facilities (Anaerobic / Biogas Plants)
 */
export const createFacilityMarker = (name?: string) => {
  return L.divIcon({
    className: 'custom-facility-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="relative h-9 w-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-115">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M17 18h1"/>
            <path d="M12 18h1"/>
            <path d="M7 18h1"/>
          </svg>
        </div>
        ${
          name
            ? `<div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">${name}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

/**
 * Custom SVG DivIcon for Waste Generators (Farms, Food Processors, Livestock)
 */
export const createGeneratorMarker = (name?: string, wasteType?: string) => {
  const badgeColor =
    wasteType === 'food'
      ? 'bg-amber-600'
      : wasteType === 'manure'
      ? 'bg-amber-800'
      : wasteType === 'industrial_organic'
      ? 'bg-blue-600'
      : 'bg-emerald-600'

  return L.divIcon({
    className: 'custom-generator-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="relative h-8 w-8 rounded-full ${badgeColor} text-white flex items-center justify-center shadow-md border-2 border-white transform transition-transform group-hover:scale-115">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        ${
          name
            ? `<div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">${name}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

/**
 * Custom SVG DivIcon for Ordered Route Stops (1, 2, 3...)
 */
export const createNumberedMarker = (num: number, label?: string) => {
  return L.divIcon({
    className: 'custom-numbered-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="relative h-8 w-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-115">
          ${num}
        </div>
        ${
          label
            ? `<div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">${label}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

/**
 * Custom Depot Marker
 */
export const createDepotMarker = () => {
  return L.divIcon({
    className: 'custom-depot-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="relative h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg border-2 border-emerald-400 transform transition-transform group-hover:scale-115">
          <svg class="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}
