import React, { useState } from 'react'
import {
  Check,
  X,
  MapPin,
  Award,
  Calendar,
  Layers,
  Clock,
  Gauge,
  Leaf,
  Building2,
  Sparkles,
} from 'lucide-react'
import { mockDb } from '../../api/mockData'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/axiosInstance'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmptyState } from '../../components/shared/EmptyState'
import { MatchScoreBreakdownModal, type MatchScoreDetails } from '../../components/matching/MatchScoreBreakdownModal'
import toast from 'react-hot-toast'
import type { MatchStatus } from '../../types'

export const IncomingMatchesPage: React.FC = () => {
  const { user } = useAuth()
  const facilityId = user?.id || 201

  const [activeTab, setActiveTab] = useState<MatchStatus>('pending')
  const [localMatches, setLocalMatches] = useState(() => mockDb.getMatches(facilityId))
  const [selectedMatchForBreakdown, setSelectedMatchForBreakdown] = useState<{
    details: MatchScoreDetails
    matchId: number
    quantityTons: number
  } | null>(null)
  const [utilizedCapacity, setUtilizedCapacity] = useState(() => {
    return mockDb.getFacilitySummary(facilityId).currentUtilizationTons
  })
  const weeklyCapacity = 120 // tons

  const openBreakdown = (match: (typeof localMatches)[0]) => {
    setSelectedMatchForBreakdown({
      matchId: match.id,
      quantityTons: match.quantityTons,
      details: {
        facilityName: user?.name || 'BioVeda Energy Hub #4',
        facilityType: 'Anaerobic Digester & Pyrolysis',
        generatorName: match.generatorName || 'Agricultural Feedstock Producer',
        wasteType: match.wasteType.replace('_', ' '),
        quantityTons: match.quantityTons,
        distanceKm: match.distanceKm,
        overallScore: match.matchScore,
        compatibilityScore: Math.min(98, Math.round(match.matchScore * 1.03)),
        distanceScore: Math.max(65, Math.round(100 - match.distanceKm * 1.25)),
        processingCostScore: 89,
        capacityScore: 92,
        carbonBenefitScore: 96,
        offtakePricePerTon: 620,
        estimatedTransportCost: Math.round(match.distanceKm * 28),
        carbonBenefitTons: Number((match.quantityTons * 1.48).toFixed(1)),
      },
    })
  }

  // Filter by active tab
  const filteredMatches = localMatches.filter((m) => {
    if (activeTab === 'pending') return m.status === 'pending'
    if (activeTab === 'scheduled') return m.status === 'scheduled' || m.status === 'confirmed'
    if (activeTab === 'collected') return m.status === 'collected'
    if (activeTab === 'processed') return m.status === 'processed'
    return true
  })

  // Tab counts
  const getTabCount = (tab: MatchStatus) => {
    return localMatches.filter((m) => {
      if (tab === 'pending') return m.status === 'pending'
      if (tab === 'scheduled') return m.status === 'scheduled' || m.status === 'confirmed'
      if (tab === 'collected') return m.status === 'collected'
      if (tab === 'processed') return m.status === 'processed'
      return false
    }).length
  }

  // Accept action (PATCH /matches/:id/confirm)
  const handleAccept = async (matchId: number, volumeTons: number) => {
    // Optimistic UI update
    setLocalMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'confirmed' } : m))
    )
    setUtilizedCapacity((prev) => Math.min(weeklyCapacity, prev + volumeTons))

    try {
      await api.patch(`/matches/${matchId}/confirm`, { status: 'confirmed' })
      toast.success('Match accepted! Added to collection scheduling queue.')
    } catch {
      // Fallback
      mockDb.updateMatchStatus(matchId, 'confirmed')
      toast.success('Match accepted! (Offline mode synced)')
    }
  }

  // Reject action (PATCH /matches/:id/reject)
  const handleReject = async (matchId: number) => {
    // Optimistic UI update
    setLocalMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'rejected' } : m))
    )

    try {
      await api.patch(`/matches/${matchId}/reject`, { status: 'rejected' })
      toast('Match declined. Waste listing returned to matching pool.', { icon: 'ℹ️' })
    } catch {
      // Fallback
      mockDb.updateMatchStatus(matchId, 'rejected')
      toast('Match declined. (Offline mode synced)', { icon: 'ℹ️' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Incoming Waste Matches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Offtake Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Review algorithmic feedstock proposals based on chemical purity, moisture, and transport radius
          </p>
        </div>

        {/* Live Capacity Buffer Bar */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[240px] space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1 text-slate-700">
              <Gauge className="h-3.5 w-3.5 text-emerald-600" />
              Intake Capacity
            </span>
            <span className="text-emerald-800">
              {utilizedCapacity.toFixed(1)} / {weeklyCapacity} Tons
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (utilizedCapacity / weeklyCapacity) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Utilization</span>
            <span>{Math.round((utilizedCapacity / weeklyCapacity) * 100)}% filled</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel rounded-2xl p-2.5 flex items-center gap-2 overflow-x-auto border border-slate-200/90 shadow-sm bg-white">
        {(['pending', 'scheduled', 'collected', 'processed'] as MatchStatus[]).map((tab) => {
          const count = getTabCount(tab)
          const isSelected = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab} Matches</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Match Cards Grid */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toUpperCase()} Matches Found`}
          description={
            activeTab === 'pending'
              ? 'All incoming waste streams have been reviewed or scheduled for collection.'
              : `No matches are currently in ${activeTab} state. New feedstock listings will appear automatically.`
          }
          icon={Layers}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.map((match) => {
            const isPending = match.status === 'pending'
            return (
              <div
                key={match.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header: Generator, Waste Type, Algorithm Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          {match.wasteType.replace('_', ' ')}
                        </span>
                        <StatusBadge status={match.status} size="sm" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading mt-1">
                        {match.generatorName}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <button
                        type="button"
                        onClick={() => openBreakdown(match)}
                        title="Click to view full 5-factor weighted algorithm breakdown"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold shadow-2xs cursor-pointer transition-colors"
                      >
                        <Award className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{match.matchScore}% Fit</span>
                        <Sparkles className="h-3 w-3 text-emerald-500" />
                      </button>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Click for Audit Breakdown</span>
                    </div>
                  </div>

                  {/* 3 Metrics: Volume, Distance, Carbon Avoidance */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">
                        Volume
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 font-heading">
                        {match.quantityTons} Tons
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">
                        Distance
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 font-heading flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {match.distanceKm} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">
                        Est. Offset
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 font-heading flex items-center justify-center gap-1">
                        <Leaf className="h-3 w-3 text-emerald-600" />
                        {(match.quantityTons * 1.48).toFixed(1)} t
                      </span>
                    </div>
                  </div>

                  {/* Expiry & Location Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                        <Clock className="h-3 w-3 text-amber-600" />
                        Offer Expiry: 36 hours remaining
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Ready: Today
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Sourced from Bengaluru South Agricultural Corridor</span>
                    </div>
                  </div>

                  {/* 5-Factor Score Analysis Button */}
                  <button
                    type="button"
                    onClick={() => openBreakdown(match)}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>View 5-Factor Matching Breakdown (Compatibility 35%, Distance 25%...)</span>
                  </button>
                </div>

                {/* Card Actions: Accept and Reject with Optimistic Updates */}
                {isPending ? (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleReject(match.id)}
                      className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject Batch</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(match.id, match.quantityTons)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Accept &amp; Schedule</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Scheduled for Fleet Run #104</span>
                    <span className="font-bold text-emerald-700">Confirmed &bull; Queue Active</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 5-Factor Matching Breakdown Modal */}
      {selectedMatchForBreakdown && (
        <MatchScoreBreakdownModal
          details={selectedMatchForBreakdown.details}
          onClose={() => setSelectedMatchForBreakdown(null)}
          onAcceptMatch={() => {
            const { matchId, quantityTons } = selectedMatchForBreakdown
            setSelectedMatchForBreakdown(null)
            handleAccept(matchId, quantityTons)
          }}
        />
      )}
    </div>
  )
}

export default IncomingMatchesPage
