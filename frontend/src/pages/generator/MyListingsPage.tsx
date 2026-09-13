import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building2,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { wasteListingService } from '../../services/wasteListing.service'
import { mockDb } from '../../api/mockData'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmptyState } from '../../components/shared/EmptyState'
import type { WasteListing } from '../../types'

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const { data: remoteListings } = useQuery({
    queryKey: ['my-listings', user?.id],
    queryFn: async () => {
      try {
        const res = await wasteListingService.getAllListings(user?.id ? { generatorId: user.id } : undefined)
        return res
      } catch (e) {
        return null
      }
    },
    staleTime: 1000 * 30,
  })

  const listings: WasteListing[] = (remoteListings && remoteListings.length > 0)
    ? remoteListings
    : mockDb.getListings()

  // Filter listings
  const filtered = listings.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || item.wasteType === categoryFilter
    const matchesSearch =
      item.wasteType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.matchedFacilityName && item.matchedFacilityName.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesCategory && matchesSearch
  })

  // Status counts
  const getCountByStatus = (st: string) => {
    if (st === 'all') return listings.length
    return listings.filter((l) => l.status === st).length
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              My Waste Listings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {listings.length} Batches
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor off-take progression, bio-refining commitments, and carbon accounting
          </p>
        </div>

        <Link
          to="/generator/listings/new"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Post New Listing</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
        {/* Status Filter Tabs with Live Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            Status:
          </span>
          {['all', 'listed', 'matched', 'scheduled', 'collected', 'processed'].map((status) => {
            const count = getCountByStatus(status)
            const isSelected = statusFilter === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category Filter & Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Waste Category Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Waste Categories</option>
              <option value="agricultural">Agricultural Residues</option>
              <option value="food">Food &amp; Commercial</option>
              <option value="manure">Livestock Manure</option>
              <option value="industrial_organic">Industrial Organics</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by waste type, address, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards or Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Waste Listings Found"
          description={
            searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No waste batches match your active filters. Try resetting search criteria.'
              : 'You have not published any waste batches yet. Start by posting your first batch.'
          }
          actionLabel="+ Post New Listing"
          actionLink="/generator/listings/new"
        />
      ) : viewMode === 'grid' ? (
        /* Interactive Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/generator/listings/${item.id}`)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 border border-slate-200/90 shadow-sm cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Type and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Batch #{item.id}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 capitalize font-heading">
                      {item.wasteType.replace('_', ' ')}
                    </h3>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Quantity</span>
                    <span className="text-sm font-extrabold text-slate-900 font-heading">
                      {item.quantityTons}{' '}
                      <span className="text-[11px] text-slate-500 font-normal">Tons</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Est. Carbon</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-heading">
                      {(item.quantityTons * 1.48).toFixed(1)}{' '}
                      <span className="text-[10px] text-emerald-600 font-normal">tCO2e</span>
                    </span>
                  </div>
                </div>

                {/* Matched Facility Info */}
                <div className="text-xs space-y-1">
                  {item.matchedFacilityName ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-2 text-emerald-900">
                      <Building2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                          Matched Off-take Facility
                        </span>
                        <p className="font-bold text-xs text-slate-900">{item.matchedFacilityName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-500">
                      <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-[11px]">Searching nearby bio-methane plants...</span>
                    </div>
                  )}
                </div>

                {/* Location & Date details */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.address || 'Central Farmgate'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      Window: {item.availableFrom} &rarr; {item.availableTo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>View Lifecycle Detail</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Table View */
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Batch ID</th>
                  <th className="pb-3">Waste Category</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Matched Facility</th>
                  <th className="pb-3">Pickup Window</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/generator/listings/${item.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 font-bold text-slate-900">#{item.id}</td>
                    <td className="py-3.5 font-bold capitalize text-slate-800">
                      {item.wasteType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 font-extrabold text-slate-900 font-heading">
                      {item.quantityTons} tons
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-slate-700">
                      {item.matchedFacilityName ? (
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.matchedFacilityName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Matching in progress</span>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {item.availableFrom} to {item.availableTo}
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-700 group-hover:underline">
                      Detail &rarr;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyListingsPage
