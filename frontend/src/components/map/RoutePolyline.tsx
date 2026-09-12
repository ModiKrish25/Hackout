import React from 'react'
import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'

export interface RoutePolylineProps {
  positions: [number, number][]
  color?: string
  weight?: number
  dashArray?: string
  opacity?: number
  showArrows?: boolean
}

// Helper to calculate bearing between two coordinates
function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180
  const startLngRad = (startLng * Math.PI) / 180
  const destLatRad = (destLat * Math.PI) / 180
  const destLngRad = (destLng * Math.PI) / 180

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad)
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad)

  let brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

// Helper to create an SVG Arrow DivIcon
function createArrowIcon(angle: number, color: string = '#059669') {
  return L.divIcon({
    className: 'route-arrow-icon',
    html: `
      <div style="transform: rotate(${angle}deg); transform-origin: center center;" class="flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5">
          <polygon points="12 2, 22 21, 12 17, 2 21" />
        </svg>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  positions,
  color = '#10b981', // emerald-500
  weight = 4,
  dashArray,
  opacity = 0.9,
  showArrows = true,
}) => {
  if (!positions || positions.length < 2) return null

  // Calculate segment midpoints and bearings for arrows
  const arrows = showArrows
    ? positions.slice(0, -1).map((start, i) => {
        const end = positions[i + 1]
        const midLat = (start[0] + end[0]) / 2
        const midLng = (start[1] + end[1]) / 2
        const angle = calculateBearing(start[0], start[1], end[0], end[1])
        return {
          position: [midLat, midLng] as [number, number],
          angle,
          key: `arrow-${i}-${start[0]}-${start[1]}`,
        }
      })
    : []

  return (
    <>
      {/* Background glow stroke */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#34d399',
          weight: weight + 4,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Core line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight,
          opacity,
          dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Pickup Order Directional Arrows */}
      {arrows.map((arrow) => (
        <Marker
          key={arrow.key}
          position={arrow.position}
          icon={createArrowIcon(arrow.angle, color)}
          interactive={false}
        />
      ))}
    </>
  )
}

export default RoutePolyline
