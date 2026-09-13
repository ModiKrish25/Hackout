import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Navigation,
  MapPin,
  Clock,
  Truck,
  Play,
  CheckCircle2,
  Sparkles,
  Weight,
  Leaf,
  Fuel,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react'
import { mockDb } from '../../api/mockData'
import { useAuth } from '../../context/AuthContext'
import { MapView, type MapMarkerData } from '../../components/map/MapView'
import { StatCard } from '../../components/shared/StatCard'
import toast from 'react-hot-toast'

export const RouteViewPage: React.FC = () => {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const defaultDate = new Date().toISOString().split('T')[0]
  const selectedDate = date || defaultDate
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [isGenerating, setIsGenerating] = useState(false)

  const route = mockDb.getRoute(user?.id || 201, currentDate)

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate)
    navigate(`/facility/routes/${newDate}`)
  }

  // Trigger routing microservice
  const handleGenerateRoute = () => {
    setIsGenerating(true)
    setTimeout(() => {
      mockDb.generateRoute(user?.id || 201, currentDate)
      setIsGenerating(false)
      toast.success('Optimized pickup route calculated with TSP solver & fuel minimization!')
    }, 750)
  }

  // Build markers for Leaflet MapView: depot + numbered stops
  const mapMarkers: MapMarkerData[] = []
  if (route) {
    // Start Depot marker
    mapMarkers.push({
      id: 'depot-start',
      lat: 12.9856,
      lng: 77.5833,
      type: 'depot',
      title: 'BioVeda Central Depot',
      subtitle: 'Depot Start & Biomass Pit Return',
    })

    // Ordered Stop markers
    route.stops.forEach((stop) => {
      mapMarkers.push({
        id: `stop-${stop.stopNumber}`,
        lat: stop.locationLat,
        lng: stop.locationLng,
        type: 'stop',
        stopNumber: stop.stopNumber,
        title: stop.generatorName,
        subtitle: stop.address,
        quantityTons: stop.quantityTons,
        wasteType: stop.wasteType,
        status: `Arrival: ${stop.estimatedArrival || '10:00 AM'}`,
      })
    })
  }

  // Logistics Optimization Metric Card (§10, §11)
  const optimizedDistance = route?.totalDistanceKm || 88.4
  const unoptimizedDistance = route ? Number((route.totalDistanceKm * 1.613).toFixed(1)) : 142.6
  const distanceSavedKm = Number((unoptimizedDistance - optimizedDistance).toFixed(1))
  const distanceSavedPct = Math.round((distanceSavedKm / unoptimizedDistance) * 100) // 38% reduction
  const dieselPerKm = 0.28 // L/km for medium commercial transport truck
  const unoptimizedFuelLiters = Number((unoptimizedDistance * dieselPerKm).toFixed(1))
  const optimizedFuelLiters = Number((optimizedDistance * dieselPerKm).toFixed(1))
  const fuelSavedLiters = Number((distanceSavedKm * dieselPerKm).toFixed(1))
  const unoptimizedEmissionsKg = Number((unoptimizedFuelLiters * 2.68).toFixed(1))
  const optimizedEmissionsKg = Number((optimizedFuelLiters * 2.68).toFixed(1))
  const co2eAvoidedKg = Number((fuelSavedLiters * 2.68).toFixed(1)) // ~42.8 kg CO2e
  const costSavedInr = Math.round(fuelSavedLiters * 92.5) // ₹92.5/L diesel

  return (
    <div className="space-y-6">
      {/* Top Header & Date / Generation Controls */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Route Logistics &amp; Dispatch
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              TSP Solver Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic traveling salesman vehicle routing minimizing transit fuel and empty backhaul mileage
          </p>
        </div>

        {/* Date Selector & Generate Route Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateRoute}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isGenerating ? 'Computing TSP Matrix...' : 'Generate Route'}</span>
          </button>
        </div>
      </div>

      {/* Route Metrics Bar using StatCard */}
      {route && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Distance"
            value={route.totalDistanceKm}
            unit="km"
            icon={Navigation}
            accentColor="emerald"
            subtitle="Optimized GPS trajectory"
            trend={{
              value: '-18.4% km',
              isPositive: true,
              label: 'vs unoptimized loop',
            }}
          />
          <StatCard
            label="Estimated Transit Time"
            value={`~${route.estimatedDurationMinutes}`}
            unit="mins"
            icon={Clock}
            accentColor="blue"
            subtitle="With traffic buffer & loading"
            trend={{
              value: 'On Schedule',
              isPositive: true,
              label: '08:30 AM departure',
            }}
          />
          <StatCard
            label="Total Tons Collected"
            value={route.totalQuantityTons}
            unit="tons"
            icon={Weight}
            accentColor="teal"
            subtitle="Aggregated organic feedstock"
            progress={{
              value: route.totalQuantityTons,
              max: 45,
              color: 'teal',
            }}
          />
          <StatCard
            label="Planned Stops"
            value={route.stops.length}
            unit="pickups"
            icon={CheckCircle2}
            accentColor="slate"
            subtitle="Doorstep bulk farm gates"
            progress={{
              value: route.stops.length,
              max: 6,
              color: 'emerald',
            }}
          />
        </div>
      )}

      {/* VRP Route Efficiency & Fuel Savings Comparison (§10, §11) */}
      <div className="glass-panel rounded-2xl p-6 space-y-5 border border-slate-200/90 shadow-sm bg-white/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading tracking-tight">
                Logistics Optimization Metric Card: VRP Efficiency &amp; Fuel Savings Benchmark
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                §10 &sect;11 Audited
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct Haul Baseline ({unoptimizedDistance} km) vs TSP Multi-Stop Solved Route ({optimizedDistance} km) &bull; {distanceSavedPct}% reduction in road transit &bull; {co2eAvoidedKg} kg CO2e saved
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            <span>-{distanceSavedPct}% Distance Reduction</span>
          </div>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Unoptimized Direct Hauls */}
          <div className="rounded-xl border border-red-200/80 bg-red-50/30 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-950">Unoptimized Direct Hauls</h3>
                  <span className="text-[11px] text-red-700">Point-to-point separate round trips</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                Baseline
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 border border-red-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Distance</span>
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  {unoptimizedDistance} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-red-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Diesel Burned</span>
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  {unoptimizedFuelLiters} L
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-red-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Logistics CO2e</span>
                <span className="text-sm font-extrabold text-red-700 font-heading">
                  {unoptimizedEmissionsKg} kg
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-red-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Fuel Cost</span>
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  ₹{Math.round(unoptimizedFuelLiters * 92.5).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-red-800/80 bg-red-100/50 p-2.5 rounded-lg leading-relaxed">
              ⚠️ Incurs high empty backhaul penalty (truck runs 50% distance unladen) with 4 discrete depot returns.
            </div>
          </div>

          {/* Card B: Optimized Multi-Stop TSP Loop */}
          <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/40 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  B
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">Optimized Multi-Stop Route</h3>
                  <span className="text-[11px] text-emerald-700">TSP closed loop with continuous collection</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Active Plan
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Distance</span>
                <span className="text-sm font-extrabold text-emerald-800 font-heading">
                  {optimizedDistance} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Diesel Burned</span>
                <span className="text-sm font-extrabold text-emerald-800 font-heading">
                  {optimizedFuelLiters} L
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Logistics CO2e</span>
                <span className="text-sm font-extrabold text-emerald-700 font-heading">
                  {optimizedEmissionsKg} kg
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Fuel Cost</span>
                <span className="text-sm font-extrabold text-emerald-800 font-heading">
                  ₹{Math.round(optimizedFuelLiters * 92.5).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg leading-relaxed flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Consolidated pickup trajectory eliminates {distanceSavedKm} km of redundant road haulage.</span>
            </div>
          </div>
        </div>

        {/* KPI Difference / Savings Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Distance Saved</span>
            <span className="text-base sm:text-lg font-extrabold font-heading text-white flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              {distanceSavedKm} km
            </span>
            <span className="text-[10px] text-emerald-200">-{distanceSavedPct}% less transit</span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Diesel Fuel Saved</span>
            <span className="text-base sm:text-lg font-extrabold font-heading text-white flex items-center justify-center gap-1">
              <Fuel className="h-4 w-4 text-amber-400" />
              {fuelSavedLiters} L
            </span>
            <span className="text-[10px] text-emerald-200">@ 0.28 L/km commercial rate</span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Avoided Transport CO2e</span>
            <span className="text-base sm:text-lg font-extrabold font-heading text-emerald-300 flex items-center justify-center gap-1">
              <Leaf className="h-4 w-4 text-emerald-400" />
              {co2eAvoidedKg} kg
            </span>
            <span className="text-[10px] text-emerald-200">2.68 kg CO2e/L diesel</span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Net Fuel Cost Saved</span>
            <span className="text-base sm:text-lg font-extrabold font-heading text-white">
              ₹{costSavedInr.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-200">Per dispatch cycle</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Split Layout: Left Queue & Right Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Step-by-Step Ordered Collection Queue */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Step-by-Step Collection Queue
              </h2>
              <p className="text-xs text-slate-500">Ordered sequence: Depot &rarr; Stops &rarr; Return</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {route?.stops.length || 0} Stops
            </span>
          </div>

          <div className="space-y-3">
            {/* Start Depot Node */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs flex items-center gap-3 shadow-sm">
              <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0">
                DEPOT
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm">BioVeda Central Processing Plant</div>
                <div className="text-slate-300 text-[11px]">Depot Departure &bull; 08:30 AM</div>
              </div>
            </div>

            {/* Stops in Order */}
            {route?.stops.map((stop) => (
              <div
                key={stop.stopNumber}
                className="p-4 rounded-xl bg-white border border-slate-200/90 text-xs space-y-2.5 shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                      #{stop.stopNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{stop.generatorName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">Pickup Node #{stop.stopNumber}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    {stop.estimatedArrival || '10:00 AM'}
                  </span>
                </div>

                <div className="text-slate-600 text-xs flex items-start gap-1.5 pt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{stop.address}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 text-slate-600 border-t border-slate-100">
                  <span className="capitalize font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {stop.wasteType.replace('_', ' ')}
                  </span>
                  <span className="font-extrabold text-slate-900 font-heading">
                    {stop.quantityTons} Tons Payload
                  </span>
                </div>
              </div>
            ))}

            {/* Return Depot Node */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-700 text-white font-black flex items-center justify-center text-xs shrink-0">
                RETURN
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900">Return to Anaerobic Digester Pit</div>
                <div className="text-slate-500 text-[11px]">Biomass weighing, tipping &bull; ~12:15 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map with Depot Marker, Numbered Stops, & Directional Polyline */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Interactive GIS Route Trajectory &amp; Turn Sequence
              </h2>
              <p className="text-xs text-slate-500">
                Turn-by-turn collection sequence with directional pickup arrows and depot anchor
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Fleet Route Active</span>
            </div>
          </div>

          <div className="w-full">
            <MapView
              center={[12.96, 77.6]}
              zoom={12}
              height="520px"
              markers={mapMarkers}
              polyline={route?.polylineCoordinates}
              fitBoundsToMarkers={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteViewPage
