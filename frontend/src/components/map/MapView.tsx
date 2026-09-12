import React, { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Layers } from 'lucide-react'
import {
  createFacilityMarker,
  createGeneratorMarker,
  createNumberedMarker,
  createDepotMarker,
} from './MarkerIcons'
import { RoutePolyline } from './RoutePolyline'
import { HeatmapLayer } from './HeatmapLayer'
import 'leaflet/dist/leaflet.css'

export interface MapMarkerData {
  id: string | number
  lat: number
  lng: number
  type: 'facility' | 'generator' | 'depot' | 'stop'
  title: string
  subtitle?: string
  quantityTons?: number
  wasteType?: string
  stopNumber?: number
  status?: string
}

export type TileTheme = 'osm' | 'hot' | 'topo'

const TILE_URLS: Record<TileTheme, { url: string; maxZoom: number; label: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    label: 'OpenStreetMap',
  },
  hot: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    maxZoom: 19,
    label: 'Humanitarian OSM',
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    maxZoom: 17,
    label: 'OpenTopoMap',
  },
}

export interface MapViewProps {
  center?: [number, number]
  zoom?: number
  height?: string
  markers?: MapMarkerData[]
  polyline?: [number, number][]
  heatPoints?: [number, number, number][]
  showHeatmap?: boolean
  fitBoundsToMarkers?: boolean
  defaultTileTheme?: TileTheme
  showTileSwitcher?: boolean
  className?: string
}

// Sub-component to fit bounds when markers change
const AutoFitBounds: React.FC<{
  markers?: MapMarkerData[]
  polyline?: [number, number][]
  center?: [number, number]
  zoom?: number
}> = ({ markers, polyline, center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const boundsPoints: [number, number][] = []

    if (markers && markers.length > 0) {
      markers.forEach((m) => {
        if (!isNaN(m.lat) && !isNaN(m.lng)) {
          boundsPoints.push([m.lat, m.lng])
        }
      })
    }

    if (polyline && polyline.length > 0) {
      polyline.forEach((p) => {
        if (!isNaN(p[0]) && !isNaN(p[1])) {
          boundsPoints.push([p[0], p[1]])
        }
      })
    }

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], zoom || 13, { animate: true })
    } else if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true })
    } else if (center) {
      map.setView(center, zoom || 12, { animate: true })
    }
  }, [map, markers, polyline, center, zoom])

  return null
}

export const MapView: React.FC<MapViewProps> = ({
  center = [12.9716, 77.5946],
  zoom = 12,
  height = '420px',
  markers = [],
  polyline,
  heatPoints,
  showHeatmap = false,
  fitBoundsToMarkers = true,
  defaultTileTheme = 'osm',
  showTileSwitcher = true,
  className = '',
}) => {
  const [currentTile, setCurrentTile] = useState<TileTheme>(defaultTileTheme)

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm z-0 ${className}`}
    >
      {/* Floating Tile Layer Switcher */}
      {showTileSwitcher && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 pl-1.5 pr-2">
            <Layers className="h-3 w-3 text-emerald-600" />
            <span className="hidden sm:inline">Tiles:</span>
          </div>
          {(['osm', 'hot', 'topo'] as TileTheme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setCurrentTile(theme)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                currentTile === theme
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {theme === 'osm' ? 'OSM Standard' : theme === 'hot' ? 'OSM Vibrant' : 'Terrain'}
            </button>
          ))}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        attributionControl={false}
      >
        {/* Dynamic Tile Layer (Voyager, CartoDB DarkMatter, or OpenStreetMap) */}
        <TileLayer
          key={currentTile}
          url={TILE_URLS[currentTile].url}
          maxZoom={TILE_URLS[currentTile].maxZoom}
        />

        {/* Auto fit bounds when markers are provided */}
        {fitBoundsToMarkers && (
          <AutoFitBounds markers={markers} polyline={polyline} center={center} zoom={zoom} />
        )}

        {/* Heatmap Layer if enabled */}
        {showHeatmap && heatPoints && heatPoints.length > 0 && (
          <HeatmapLayer points={heatPoints} radius={28} blur={20} />
        )}

        {/* Route Polyline if provided */}
        {polyline && polyline.length > 1 && <RoutePolyline positions={polyline} />}

        {/* Markers */}
        {markers.map((m) => {
          let icon
          if (m.type === 'facility') {
            icon = createFacilityMarker(m.title)
          } else if (m.type === 'stop') {
            icon = createNumberedMarker(m.stopNumber || 1, m.title)
          } else if (m.type === 'depot') {
            icon = createDepotMarker()
          } else {
            icon = createGeneratorMarker(m.title, m.wasteType)
          }

          return (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-1.5 min-w-[180px] font-sans text-slate-800">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {m.type === 'facility'
                        ? 'Bio-Conversion Plant'
                        : m.type === 'stop'
                        ? `Stop #${m.stopNumber}`
                        : 'Waste Producer'}
                    </span>
                    {m.status && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {m.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{m.title}</h4>
                    {m.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{m.subtitle}</p>}
                  </div>

                  {(m.quantityTons !== undefined || m.wasteType) && (
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 bg-slate-50 p-1.5 rounded">
                      {m.wasteType && <span className="capitalize font-medium">{m.wasteType}</span>}
                      {m.quantityTons !== undefined && (
                        <span className="font-bold text-slate-900">{m.quantityTons} Tons</span>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default MapView
