import React from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  MapPin,
  Leaf,
  Recycle,
  ChevronRight,
  CheckCircle2,
  Navigation,
  Gauge,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockDb } from '../../api/mockData'
import { StatCard } from '../../components/shared/StatCard'
import { MapView, type MapMarkerData } from '../../components/map/MapView'

export const FacilityDashboard: React.FC = () => {
  const { user } = useAuth()
  const summary = mockDb.getFacilitySummary(user?.id || 201)
  const pendingMatches = mockDb.getMatches(user?.id || 201, 'pending')
  const listings = mockDb.getListings()

  // Area map markers: Facility location + adjacent pending/scheduled listings
  const areaMarkers: MapMarkerData[] = [
    {
      id: 'main-facility',
      lat: user?.location_lat || 12.9856,
      lng: user?.location_lng || 77.5833,
      type: 'facility',
      title: user?.name || 'BioVeda Energy Biomethanation Plant',
      subtitle: 'Central Anaerobic Processing Hub',
      status: 'Online',
    },
    ...listings.map((l) => ({
      id: `listing-${l.id}`,
      lat: l.locationLat,
      lng: l.locationLng,
      type: 'generator' as const,
      title: `${l.generatorName || 'Generator'} (#${l.id})`,
      subtitle: l.address,
      quantityTons: l.quantityTons,
      wasteType: l.wasteType,
      status: l.status,
    })),
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Facility Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Bio-Conversion Plant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Plant: <strong className="text-slate-800">{user?.name}</strong> &bull; {user?.city || 'Bengaluru'}, {user?.state || 'Karnataka'} &bull; Max Intake: {summary.weeklyCapacityTons} Tons/Week
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/facility/matches"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Layers className="h-4 w-4" />
            <span>Review Incoming Matches ({summary.pendingMatchesCount})</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacity Utilization with Progress Bar */}
        <StatCard
          label="Capacity Utilization"
          value={`${summary.capacityUtilizationPercent}%`}
          unit={`(${summary.currentUtilizationTons}/${summary.weeklyCapacityTons} t)`}
          icon={Gauge}
          accentColor="emerald"
          trend={{
            value: `${summary.weeklyCapacityTons - summary.currentUtilizationTons}t available`,
            isPositive: true,
            label: 'weekly intake buffer',
          }}
          progress={{
            value: summary.capacityUtilizationPercent,
            max: 100,
            color: summary.capacityUtilizationPercent > 85 ? 'amber' : 'emerald',
          }}
        />

        {/* Pending Matches */}
        <StatCard
          label="Pending Matches"
          value={summary.pendingMatchesCount}
          unit="batches"
          icon={Layers}
          accentColor="blue"
          trend={{
            value: 'Action Required',
            isNeutral: true,
            label: 'awaiting confirmation',
          }}
          progress={{
            value: summary.pendingMatchesCount,
            max: 10,
            color: 'blue',
          }}
        />

        {/* Tons Processed */}
        <StatCard
          label="Tons Processed"
          value={summary.tonsProcessedAllTime}
          unit="tons"
          icon={Recycle}
          accentColor="teal"
          trend={{
            value: '+24.5%',
            isPositive: true,
            label: 'converted to biomethane',
          }}
          progress={{
            value: summary.tonsProcessedAllTime,
            max: 2000,
            color: 'teal',
          }}
        />

        {/* CO2 Sequestered */}
        <StatCard
          label="CO2 Sequestered"
          value={summary.co2SequesteredAllTime}
          unit="tCO2e"
          icon={Leaf}
          accentColor="emerald"
          trend={{
            value: 'Audited',
            isPositive: true,
            label: 'certified offsets issued',
          }}
          progress={{
            value: summary.co2SequesteredAllTime,
            max: 3000,
            color: 'emerald',
          }}
        />
      </div>

      {/* Area Map: Facility Location and Adjacent Pending / Scheduled Listings */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Intake Catchment Area &amp; Sourcing Map
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GIS view showing plant depot pin and adjacent regional waste batches available for off-take
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span> Plant Depot
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Adjacent Listings
            </span>
          </div>
        </div>

        <MapView
          height="340px"
          center={[user?.location_lat || 12.9856, user?.location_lng || 77.5833]}
          zoom={12}
          markers={areaMarkers}
          fitBoundsToMarkers={true}
        />
      </div>

      {/* Split Section: Today's Route Teaser & Incoming Matches Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Route Teaser Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Today's Optimized Route
                </h2>
                <p className="text-xs text-slate-500">
                  Automated dispatch sequence for scheduled bulk collections
                </p>
              </div>
              <Link
                to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Route View</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-900">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  <span>Dispatch Run #104 (Active)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900 uppercase tracking-wider">
                  3 Planned Stops
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
                  <span className="text-sm font-extrabold text-slate-900 font-heading">28.4 km</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                  <span className="text-sm font-extrabold text-slate-900 font-heading">~85 min</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Payload</span>
                  <span className="text-sm font-extrabold text-emerald-800 font-heading">38.2 Tons</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">
                Covers Adugodi fruit market, Ejipura dairy yard, and BTM farming collective with dynamic TSP waypoint optimization.
              </p>
            </div>
          </div>

          <Link
            to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Launch Interactive Route View &amp; Polyline &rarr;</span>
          </Link>
        </div>

        {/* Incoming Matches Quick Action Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Pending Match Queue
              </h2>
              <p className="text-xs text-slate-500">
                Algorithms matched organic feedstock within your operational intake radius
              </p>
            </div>
            <Link
              to="/facility/matches"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({pendingMatches.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingMatches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900">{match.generatorName}</div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                    <span className="capitalize font-semibold text-emerald-700">
                      {match.wasteType.replace('_', ' ')}
                    </span>
                    &bull;
                    <span className="font-semibold text-slate-800">{match.quantityTons} Tons</span>
                    &bull;
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {match.distanceKm} km away
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Match</span>
                    <span className="font-extrabold text-emerald-700">{match.matchScore}%</span>
                  </div>
                  <Link
                    to="/facility/matches"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                    title="Review Match"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilityDashboard
