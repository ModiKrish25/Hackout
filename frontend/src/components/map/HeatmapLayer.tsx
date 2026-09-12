import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity?: number
}

export interface HeatmapLayerProps {
  points: [number, number, number][] | HeatmapPoint[]
  radius?: number
  blur?: number
  maxZoom?: number
  max?: number
  gradient?: Record<number, string>
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  points,
  radius = 25,
  blur = 18,
  maxZoom = 17,
  max = 1.0,
  gradient = {
    0.2: '#86efac', // light green
    0.4: '#34d399', // mint
    0.6: '#10b981', // emerald
    0.8: '#f59e0b', // amber
    1.0: '#ef4444', // red
  },
}) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !points || points.length === 0) return

    // Format points to [lat, lng, intensity]
    const formattedPoints: [number, number, number][] = points.map((p) => {
      if (Array.isArray(p)) {
        return [p[0], p[1], p[2] ?? 0.5]
      }
      return [p.lat, p.lng, p.intensity ?? 0.5]
    })

    // Check if L.heatLayer is available from leaflet.heat
    const heatLayerFn = (L as any).heatLayer
    if (!heatLayerFn) {
      console.warn('Leaflet.heat layer function not available on L.')
      return
    }

    const layer = heatLayerFn(formattedPoints, {
      radius,
      blur,
      maxZoom,
      max,
      gradient,
    }).addTo(map)

    return () => {
      if (map && layer) {
        map.removeLayer(layer)
      }
    }
  }, [map, points, radius, blur, maxZoom, max, gradient])

  return null
}

export default HeatmapLayer
