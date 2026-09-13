import React, { useState, useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import {
  Play,
  Pause,
  RotateCcw,
  Truck,
  Navigation,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export interface RouteWaypoint {
  lat: number
  lng: number
  name: string
  distanceKm: number
  status: string
  etaMinutes?: number
}

export interface AnimatedRouteMapProps {
  origin?: {
    name: string
    lat: number
    lng: number
    type?: string
  }
  destination?: {
    name: string
    lat: number
    lng: number
    type?: string
  }
  waypoints?: RouteWaypoint[]
  totalDistanceKm?: number
  baselineDistanceKm?: number // e.g. 52 km direct haul
  distanceSavedPct?: number // e.g. 18%
  vehicleName?: string
  driverName?: string
  fuelRateLPerKm?: number // e.g. 0.28 L/km
  height?: string
  className?: string
  autoPlay?: boolean
  showControls?: boolean
  showTelemetryHUD?: boolean
  onArrival?: () => void
}

// Default Punjab agricultural-to-industrial corridor (Khanna Farm Gate -> Ludhiana Biochar Sink)
const DEFAULT_ORIGIN = {
  name: 'Khanna Farm Gate #4, Punjab',
  lat: 30.7046,
  lng: 76.2219,
  type: 'farm',
}

const DEFAULT_DESTINATION = {
  name: 'Ludhiana Biochar Industrial Sink',
  lat: 30.901,
  lng: 75.8573,
  type: 'facility',
}

const DEFAULT_WAYPOINTS: RouteWaypoint[] = [
  { lat: 30.7046, lng: 76.2219, name: 'Khanna Farm Gate (Weighbridge In)', distanceKm: 0.0, status: 'Biomass Loaded' },
  { lat: 30.7385, lng: 76.1422, name: 'NH-44 Toll Plaza Waypoint', distanceKm: 11.8, status: 'Cruising GT Road' },
  { lat: 30.8122, lng: 75.9835, name: 'Doraha Industrial Flyover', distanceKm: 26.4, status: 'Corridor Transit' },
  { lat: 30.8745, lng: 75.8941, name: 'Ludhiana South Outer Ring', distanceKm: 37.6, status: 'Approaching City Ring' },
  { lat: 30.901, lng: 75.8573, name: 'Ludhiana Pyrolysis Intake Gate', distanceKm: 42.4, status: 'Weighbridge Intake' },
]

// Generate intermediate smooth curved coordinates between waypoints
function generateDenseTrajectory(waypoints: RouteWaypoint[], pointsPerSegment = 25): [number, number][] {
  const result: [number, number][] = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i]
    const p2 = waypoints[i + 1]

    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment
      // Smooth linear interpolation with slight curve offset
      const lat = p1.lat + (p2.lat - p1.lat) * t
      const lng = p1.lng + (p2.lng - p1.lng) * t
      result.push([lat, lng])
    }
  }
  const last = waypoints[waypoints.length - 1]
  result.push([last.lat, last.lng])
  return result
}

// Calculate bearing angle between two geo points
function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const y = Math.sin(((lng2 - lng1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lng2 - lng1) * Math.PI) / 180)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

// Custom Marker Icons
const createOriginIcon = (name: string) =>
  L.divIcon({
    className: 'custom-farm-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="relative h-10 w-10 rounded-2xl bg-emerald-700 border-2 border-white text-white flex items-center justify-center shadow-xl">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-50">
          📍 ${name || 'Farm Origin'}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

const createDestinationIcon = (name: string) =>
  L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-2 rounded-full bg-teal-500/30 animate-pulse"></div>
        <div class="relative h-10 w-10 rounded-2xl bg-teal-800 border-2 border-white text-white flex items-center justify-center shadow-xl">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M17 18h1"/>
            <path d="M12 18h1"/>
            <path d="M7 18h1"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-50">
          🏭 ${name || 'Processing Facility'}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

const createWaypointIcon = (num: number) =>
  L.divIcon({
    className: 'custom-waypoint-marker',
    html: `
      <div class="h-6 w-6 rounded-full bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-bold flex items-center justify-center shadow-sm">
        ${num}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

const createAnimatedTruckIcon = (bearing: number, isMoving: boolean) =>
  L.divIcon({
    className: 'custom-animated-truck',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 rounded-full bg-emerald-500/40 ${isMoving ? 'animate-ping' : ''}"></div>
        <div class="relative h-11 w-11 rounded-2xl bg-slate-950 border-2 border-emerald-400 text-white flex items-center justify-center shadow-2xl transition-transform" style="transform: rotate(${bearing}deg)">
          <svg class="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })

// Auto Pan Helper to keep truck centered if follow is active
const MapFollowController: React.FC<{ coords: [number, number]; enabled: boolean }> = ({ coords, enabled }) => {
  const map = useMap()
  useEffect(() => {
    if (enabled) {
      map.panTo(coords, { animate: true, duration: 0.25 })
    }
  }, [coords, enabled, map])
  return null
}

export const AnimatedRouteMap: React.FC<AnimatedRouteMapProps> = ({
  origin = DEFAULT_ORIGIN,
  destination = DEFAULT_DESTINATION,
  waypoints = DEFAULT_WAYPOINTS,
  totalDistanceKm = 42.4,
  baselineDistanceKm = 51.8,
  distanceSavedPct = 18,
  vehicleName = 'Eicher Pro 3019 (16T)',
  driverName = 'Harpreet Singh (PB-10-9884)',
  fuelRateLPerKm = 0.28,
  height = '460px',
  className = '',
  autoPlay = true,
  showControls = true,
  showTelemetryHUD = true,
  onArrival,
}) => {
  // Dense coordinate path (100+ points for silky-smooth motion)
  const trajectoryPoints = useMemo(() => generateDenseTrajectory(waypoints, 25), [waypoints])

  // Simulation State
  const [progress, setProgress] = useState<number>(0) // 0 to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1) // 1x, 2x, 4x
  const [followTruck, setFollowTruck] = useState<boolean>(false)

  // Derive current position index along trajectory
  const currentIndex = Math.min(
    trajectoryPoints.length - 1,
    Math.floor((progress / 100) * (trajectoryPoints.length - 1))
  )
  const currentCoords = trajectoryPoints[currentIndex]

  // Calculate bearing to next point for truck orientation
  const nextCoords = trajectoryPoints[Math.min(trajectoryPoints.length - 1, currentIndex + 1)]
  const truckBearing = getBearing(currentCoords[0], currentCoords[1], nextCoords[0], nextCoords[1])

  // Derive Telemetry Metrics
  const distanceTraveledKm = Number(((progress / 100) * totalDistanceKm).toFixed(1))
  const fuelUsedLiters = Number((distanceTraveledKm * fuelRateLPerKm).toFixed(1))
  const totalFuelLiters = Number((totalDistanceKm * fuelRateLPerKm).toFixed(1))
  const fuelSavedLiters = Number((fuelUsedLiters * (distanceSavedPct / 100)).toFixed(1))
  const avoidedCO2eKg = Number((fuelSavedLiters * 2.68).toFixed(1)) // 2.68 kg CO2e / liter diesel

  // Determine active milestone waypoint
  const activeWaypointIndex = Math.min(
    waypoints.length - 1,
    Math.floor((progress / 100) * (waypoints.length - 1))
  )
  const activeWaypoint = waypoints[activeWaypointIndex]
  const isArrived = progress >= 100

  // Animation Loop via timer
  useEffect(() => {
    if (isPlaying && progress < 100) {
      const increment = 0.35 * speedMultiplier
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            onArrival?.()
            return 100
          }
          return Math.min(100, prev + increment)
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying, progress, speedMultiplier, onArrival])

  // Polyline splits: traveled vs remaining
  const traveledPolyline = trajectoryPoints.slice(0, currentIndex + 1)
  const remainingPolyline = trajectoryPoints.slice(currentIndex)

  // Map initial bounds center
  const mapCenter: [number, number] = [
    (origin.lat + destination.lat) / 2,
    (origin.lng + destination.lng) / 2,
  ]

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl ${className}`}>
      {/* 1. Leaflet Interactive GIS Map Canvas */}
      <div style={{ height }} className="w-full relative">
        <MapContainer
          center={mapCenter}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          {/* Follow Camera Controller */}
          <MapFollowController coords={currentCoords} enabled={followTruck} />

          {/* Remaining Path Polyline (Dashed Slate) */}
          {remainingPolyline.length > 1 && (
            <Polyline
              positions={remainingPolyline}
              pathOptions={{
                color: '#64748b',
                weight: 4,
                dashArray: '6, 8',
                opacity: 0.6,
              }}
            />
          )}

          {/* Traveled Path Polyline (Solid Glowing Emerald) */}
          {traveledPolyline.length > 1 && (
            <>
              {/* Glow background stroke */}
              <Polyline
                positions={traveledPolyline}
                pathOptions={{
                  color: '#34d399',
                  weight: 8,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core green stroke */}
              <Polyline
                positions={traveledPolyline}
                pathOptions={{
                  color: '#10b981',
                  weight: 4,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}

          {/* Origin Marker (Farm) */}
          <Marker position={[origin.lat, origin.lng]} icon={createOriginIcon(origin.name)}>
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-emerald-700 block font-heading">📍 Farm Origin</strong>
                <p className="text-slate-600 mt-0.5">{origin.name}</p>
                <span className="text-[10px] text-slate-400 font-mono">Weighbridge Gate Departure</span>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker (Facility) */}
          <Marker position={[destination.lat, destination.lng]} icon={createDestinationIcon(destination.name)}>
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-teal-700 block font-heading">🏭 Processing Destination</strong>
                <p className="text-slate-600 mt-0.5">{destination.name}</p>
                <span className="text-[10px] text-slate-400 font-mono">Pyrolysis &amp; Biochar Kiln Intake</span>
              </div>
            </Popup>
          </Marker>

          {/* Intermediate Waypoints */}
          {waypoints.slice(1, -1).map((wp, idx) => (
            <Marker key={idx} position={[wp.lat, wp.lng]} icon={createWaypointIcon(idx + 1)}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-slate-900 block font-heading">Corridor Waypoint #{idx + 1}</strong>
                  <p className="text-slate-600 mt-0.5">{wp.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{wp.distanceKm} km from origin</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Animated Moving Truck Marker */}
          <Marker
            position={currentCoords}
            icon={createAnimatedTruckIcon(truckBearing, isPlaying)}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-emerald-600 flex items-center gap-1 font-heading">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{vehicleName}</span>
                </strong>
                <p className="text-slate-600 mt-0.5">Driver: {driverName}</p>
                <span className="text-[10px] font-mono text-slate-400">
                  {distanceTraveledKm} km traveled &bull; {fuelUsedLiters} L diesel
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* 2. Floating Live Telemetry Overlay HUD */}
      {showTelemetryHUD && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[500] pointer-events-auto">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-white shadow-xl space-y-3">
            {/* Status Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Navigation className="h-4 w-4 animate-spin-slow" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-heading">
                      Live Telemetry Stream
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate max-w-[240px]">
                    {isArrived ? '✅ Destination Weighbridge Gate Reached' : activeWaypoint.status}
                  </p>
                </div>
              </div>

              {/* VRP Gain Badge */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                -{distanceSavedPct}% Transit Saved
              </span>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Distance</span>
                <strong className="text-sm font-extrabold text-emerald-400 font-mono">
                  {distanceTraveledKm} <span className="text-[10px] text-slate-400 font-normal">/ {totalDistanceKm}k</span>
                </strong>
                <span className="text-[9px] text-slate-500 block">Baseline: {baselineDistanceKm}k</span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Diesel Used</span>
                <strong className="text-sm font-extrabold text-amber-400 font-mono">
                  {fuelUsedLiters} <span className="text-[10px] text-slate-400 font-normal">/ {totalFuelLiters}L</span>
                </strong>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Saved Fuel</span>
                <strong className="text-sm font-extrabold text-teal-400 font-mono">
                  -{fuelSavedLiters} L
                </strong>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Avoided CO₂e</span>
                <strong className="text-sm font-extrabold text-emerald-400 font-mono">
                  -{avoidedCO2eKg} kg
                </strong>
              </div>
            </div>

            {/* Waypoint Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[150px]">From: {origin.name.split(',')[0]}</span>
                <span className="font-mono font-bold text-emerald-300">{progress.toFixed(0)}%</span>
                <span className="truncate max-w-[150px]">To: {destination.name.split(' ')[0]}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Playback Controls Bar */}
      {showControls && (
        <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Left: Play / Pause / Replay & Speed */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isArrived) {
                  setProgress(0)
                  setIsPlaying(true)
                } else {
                  setIsPlaying(!isPlaying)
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {isArrived ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Replay</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setProgress(0)
                setIsPlaying(false)
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              title="Reset Animation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-[11px] font-mono font-bold">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    speedMultiplier === spd
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Follow Toggle */}
            <button
              type="button"
              onClick={() => setFollowTruck(!followTruck)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                followTruck
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Follow Truck
            </button>
          </div>

          {/* Center / Right: Interactive Timeline Scrubber */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">0km</span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={progress}
              onChange={(e) => {
                setProgress(Number(e.target.value))
                setIsPlaying(false)
              }}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-emerald-400 font-bold">{totalDistanceKm}km</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimatedRouteMap
