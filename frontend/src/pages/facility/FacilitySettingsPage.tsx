import React, { useState, useEffect } from 'react'
import {
  Save,
  Building2,
  MapPin,
  Check,
  Sliders,
  Crosshair,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mockDb } from '../../api/mockData'
import type { WasteType } from '../../types'
import toast from 'react-hot-toast'

// Custom Leaflet DivIcon for Facility Pin
const createFacilitySettingPin = () => {
  return L.divIcon({
    className: 'custom-facility-setting-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping"></div>
        <div class="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M17 18h1"/>
            <path d="M12 18h1"/>
            <path d="M7 18h1"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

// Subcomponent: Click to pin listener
const MapPickerEvents: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)))
    },
  })
  return null
}

// Subcomponent: Recenter map smoothly
const MapFlyTo: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    map.flyTo(coords, Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [coords, map])
  return null
}

export const FacilitySettingsPage: React.FC = () => {
  const facility = mockDb.getFacilities()[0]

  const [name, setName] = useState(facility.name)
  const [facilityType, setFacilityType] = useState(facility.facilityType)
  const [weeklyCapacity, setWeeklyCapacity] = useState(facility.weeklyCapacityTons.toString())
  const [acceptedTypes, setAcceptedTypes] = useState<WasteType[]>(facility.acceptedWasteTypes)
  const [latitude, setLatitude] = useState<number>(facility.locationLat)
  const [longitude, setLongitude] = useState<number>(facility.locationLng)
  const [address, setAddress] = useState(facility.address || 'Rajajinagar Industrial Area, Bangalore')
  const [isSaving, setIsSaving] = useState(false)

  // Multi-select toggle for accepted waste types
  const toggleType = (type: WasteType) => {
    if (acceptedTypes.includes(type)) {
      if (acceptedTypes.length > 1) {
        setAcceptedTypes(acceptedTypes.filter((t) => t !== type))
      } else {
        toast.error('Facility must accept at least 1 organic feedstock type.')
      }
    } else {
      setAcceptedTypes([...acceptedTypes, type])
    }
  }

  // Use browser GPS for plant location
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    toast.loading('Acquiring GPS location...', { id: 'fac-gps' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5))
        const lng = Number(pos.coords.longitude.toFixed(5))
        setLatitude(lat)
        setLongitude(lng)
        toast.success(`Plant location updated: ${lat}, ${lng}`, { id: 'fac-gps' })
      },
      () => {
        toast.error('Unable to retrieve GPS. Click on the map to pin your depot.', { id: 'fac-gps' })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    mockDb.updateFacility(facility.id, {
      name,
      facilityType,
      weeklyCapacityTons: parseFloat(weeklyCapacity) || 120,
      acceptedWasteTypes: acceptedTypes,
      locationLat: latitude,
      locationLng: longitude,
      address,
    })

    setTimeout(() => {
      setIsSaving(false)
      toast.success('Facility operational settings and GIS coordinates updated!')
    }, 450)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Facility Operational Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Plant ID: #{facility.id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure processing capacity limits, accepted feedstock criteria, and GIS operational location
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200/90 shadow-sm bg-white">
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Facility Name & Technology */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Plant Identification &amp; Technology
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bio-Conversion Technology
                </label>
                <input
                  type="text"
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value)}
                  required
                  placeholder="e.g. Anaerobic Biomethanation Digester"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Weekly Capacity Limit (Tons) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Weekly Capacity Limit (Tons/Week) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Sliders className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="5"
                    min="10"
                    max="5000"
                    value={weeklyCapacity}
                    onChange={(e) => setWeeklyCapacity(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Maximum intake volume across all active routes</p>
              </div>
            </div>
          </div>

          {/* 2. Accepted Waste Types Multi-Select Checkboxes */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. Accepted Feedstock Streams (Multi-Select) <span className="text-red-500">*</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    type: 'agricultural' as WasteType,
                    label: 'Agricultural Biomass',
                    desc: 'Crop residues, sugarcane bagasse, paddy straw',
                  },
                  {
                    type: 'food' as WasteType,
                    label: 'Food & Commercial Organics',
                    desc: 'Market vegetable refuse, restaurant scraps, fruit pulp',
                  },
                  {
                    type: 'manure' as WasteType,
                    label: 'Livestock & Dairy Manure',
                    desc: 'Bovine slurry, poultry bedding, animal husbandry dung',
                  },
                  {
                    type: 'industrial_organic' as WasteType,
                    label: 'Industrial Organics',
                    desc: 'Brewery spent grain, bakery mash, distillery slops',
                  },
                ] as const
              ).map((item) => {
                const isChecked = acceptedTypes.includes(item.type)
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleType(item.type)}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold block">{item.label}</span>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Operational Location Editor & Interactive Map */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                3. Facility Depot Location &amp; GIS Coordinates <span className="text-red-500">*</span>
              </span>
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
                <span>Snap to My Current GPS</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Depot Street Address / Landmark
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. Rajajinagar Eco-Industrial Hub, Gate #4"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Interactive Leaflet Map Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">Tap anywhere on the map to pin facility plant depot:</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>

              <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    maxZoom={19}
                  />
                  <MapPickerEvents
                    onPick={(lat, lng) => {
                      setLatitude(lat)
                      setLongitude(lng)
                    }}
                  />
                  <MapFlyTo coords={[latitude, longitude]} />
                  <Marker
                    position={[latitude, longitude]}
                    icon={createFacilitySettingPin()}
                  />
                </MapContainer>

                <div className="absolute bottom-2 left-2 z-[500] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-sm pointer-events-none">
                  🏭 Click map to adjust plant depot location
                </div>
              </div>

              {/* Numeric Coordinate Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Depot Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Depot Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Update Operational Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacilitySettingsPage
