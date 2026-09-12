import React from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle,
  Recycle,
  Leaf,
  DollarSign,
  Award,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockDb } from '../../api/mockData'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { MapView, type MapMarkerData } from '../../components/map/MapView'

export const GeneratorDashboard: React.FC = () => {
  const { user } = useAuth()
  const summary = mockDb.getGeneratorSummary(user?.id || 101)
  const listings = mockDb.getListings()
  const recentListings = listings.slice(0, 5)

  // Map markers for generator's active and historical waste batches
  const mapMarkers: MapMarkerData[] = listings.map((l) => ({
    id: l.id,
    lat: l.locationLat,
    lng: l.locationLng,
    type: 'generator',
    title: `${l.wasteType.toUpperCase()} Batch #${l.id}`,
    subtitle: l.address || 'Farmgate / Factory Yard',
    quantityTons: l.quantityTons,
    wasteType: l.wasteType,
    status: l.status,
  }))

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Generator Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Verified Producer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome, <strong className="text-slate-800">{user?.name}</strong> &bull; {user?.city || 'Bengaluru'}, {user?.state || 'Karnataka'} &bull; Base Coordinates: {user?.location_lat?.toFixed(4) || '12.9716'}, {user?.location_lng?.toFixed(4) || '77.5946'}
          </p>
        </div>

        {/* Quick Action: + Post New Listing Button */}
        <Link
          to="/generator/listings/new"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Post New Listing</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Listings */}
        <StatCard
          label="Active Listings"
          value={summary.activeListingsCount}
          unit="batches"
          icon={Recycle}
          accentColor="emerald"
          trend={{
            value: '+2 this week',
            isPositive: true,
            label: 'in matching pool',
          }}
          progress={{
            value: summary.activeListingsCount,
            max: 10,
            color: 'emerald',
          }}
        />

        {/* Tons Diverted */}
        <StatCard
          label="Tons Diverted"
          value={summary.tonsDivertedAllTime}
          unit="tons"
          icon={Leaf}
          accentColor="teal"
          trend={{
            value: '+14.2%',
            isPositive: true,
            label: 'vs previous cycle',
          }}
          progress={{
            value: summary.tonsDivertedAllTime,
            max: 200,
            color: 'teal',
          }}
        />

        {/* Revenue Earned */}
        <StatCard
          label="Revenue Earned"
          value={`$${summary.revenueEarned.toLocaleString()}`}
          icon={DollarSign}
          accentColor="blue"
          trend={{
            value: '+18.5%',
            isPositive: true,
            label: 'from verified off-take',
          }}
          progress={{
            value: 78,
            max: 100,
            color: 'blue',
          }}
        />

        {/* CO2 Credits Earned */}
        <StatCard
          label="CO2 Credits Earned"
          value={summary.co2CreditsEarned}
          unit="tCO2e"
          icon={Award}
          accentColor="emerald"
          trend={{
            value: 'Certified',
            isPositive: true,
            label: 'Verra/Gold Standard audit',
          }}
          progress={{
            value: summary.co2CreditsEarned,
            max: 150,
            color: 'emerald',
          }}
        />
      </div>

      {/* Interactive Mini-Map of Generator's Waste Locations */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Waste Sourcing &amp; Offtake Geographic Map
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive Leaflet GIS showing active listings and completed pickup coordinates
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Active Batches
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Scheduled Pickup
            </span>
          </div>
        </div>

        <MapView
          height="340px"
          center={[user?.location_lat || 12.9352, user?.location_lng || 77.6245]}
          zoom={12}
          markers={mapMarkers}
          fitBoundsToMarkers={true}
        />
      </div>

      {/* Recent Listings Mini-Table with Live Status Badges */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Recent Waste Listings
            </h2>
            <p className="text-xs text-slate-500">
              Real-time off-take status, dispatch matching, and facility assignments
            </p>
          </div>
          <Link
            to="/generator/listings"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Listings ({listings.length})</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Batch &amp; Type</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Moisture</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Pickup Address</th>
                <th className="pb-3">Published Date</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 font-bold capitalize text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>{listing.wasteType.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">#{listing.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800">
                    {listing.quantityTons} <span className="text-[10px] text-slate-400 font-normal">tons</span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {listing.moistureContent ? `${listing.moistureContent}%` : 'N/A'}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={listing.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-slate-500">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{listing.address || 'Central Ag Farm Gate'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to={`/generator/listings/${listing.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <span>Track</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GeneratorDashboard
