import React from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Sparkles,
  MapPin,
  Scale,
  DollarSign,
  Leaf,
  Layers,
  ArrowRight,
} from 'lucide-react'

export interface MatchScoreDetails {
  facilityName: string
  facilityType: string
  generatorName: string
  wasteType: string
  quantityTons: number
  distanceKm: number
  overallScore: number // e.g. 94%

  // 5 criteria sub-scores (0 to 100)
  compatibilityScore: number // 35% weight
  distanceScore: number // 25% weight
  processingCostScore: number // 15% weight
  capacityScore: number // 15% weight
  carbonBenefitScore: number // 10% weight

  offtakePricePerTon: number
  estimatedTransportCost: number
  carbonBenefitTons: number
}

interface MatchScoreBreakdownModalProps {
  details: MatchScoreDetails
  onClose: () => void
  onAcceptMatch?: () => void
}

export const MatchScoreBreakdownModal: React.FC<MatchScoreBreakdownModalProps> = ({
  details,
  onClose,
  onAcceptMatch,
}) => {
  const criteria = [
    {
      name: 'Feedstock Compatibility & Purity',
      weight: '35%',
      score: details.compatibilityScore,
      weightedValue: (details.compatibilityScore * 0.35).toFixed(1),
      icon: Layers,
      color: 'bg-emerald-500',
      description: `Optimal bio-feedstock pairing with ${details.facilityType} intake parameters.`,
    },
    {
      name: 'Logistics Proximity & Distance',
      weight: '25%',
      score: details.distanceScore,
      weightedValue: (details.distanceScore * 0.25).toFixed(1),
      icon: MapPin,
      color: 'bg-blue-500',
      description: `${details.distanceKm} km direct haul corridor minimizes road transit cost.`,
    },
    {
      name: 'Off-take Cost & Economic Yield',
      weight: '15%',
      score: details.processingCostScore,
      weightedValue: (details.processingCostScore * 0.15).toFixed(1),
      icon: DollarSign,
      color: 'bg-indigo-500',
      description: `Competitive tipping fee & ₹${details.offtakePricePerTon}/ton producer revenue.`,
    },
    {
      name: 'Intake Capacity & Throughput Buffer',
      weight: '15%',
      score: details.capacityScore,
      weightedValue: (details.capacityScore * 0.15).toFixed(1),
      icon: Scale,
      color: 'bg-amber-500',
      description: `Facility has immediate buffer for ${details.quantityTons} tons without queuing.`,
    },
    {
      name: 'Verified Carbon Sequestration Value',
      weight: '10%',
      score: details.carbonBenefitScore,
      weightedValue: (details.carbonBenefitScore * 0.1).toFixed(1),
      icon: Leaf,
      color: 'bg-teal-500',
      description: `Avoided decomposition generating ${details.carbonBenefitTons} tCO₂e mitigation yield.`,
    },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Multi-Criteria Algorithmic Match
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-white">
              Why This Facility Was Ranked #{details.overallScore >= 90 ? '1' : '2'}
            </h2>
            <p className="text-xs text-slate-300">
              Transparent 5-dimensional weighted scoring model evaluating feedstock suitability, transit radius, economics, and carbon yield.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Facility & Total Score Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Matched Facility
              </span>
              <h3 className="text-lg font-bold text-slate-900">{details.facilityName}</h3>
              <p className="text-xs text-slate-600">{details.facilityType} &bull; {details.distanceKm} km away</p>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-emerald-300 shadow-xs shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">TOTAL SCORE</span>
                <span className="text-xs font-bold text-emerald-700">Prime Offtake</span>
              </div>
              <div className="h-14 w-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-extrabold font-heading shadow-md shadow-emerald-600/30">
                {details.overallScore}%
              </div>
            </div>
          </div>

          {/* 5-Criteria Weighted Breakdown Cards */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading">
              Weighted Parameter Analysis (§12)
            </h4>

            {criteria.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${item.color} text-white`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Weight: {item.weight}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {item.score}%
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 font-mono">
                        (+{item.weightedValue} pts)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">{item.description}</p>
                </div>
              )
            })}
          </div>

          {/* Economic & Carbon Benefit Strip */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Estimated Transit Cost</span>
              <strong className="text-slate-900 text-sm">₹{details.estimatedTransportCost.toLocaleString()}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Net Carbon Value</span>
              <strong className="text-emerald-700 text-sm">+{details.carbonBenefitTons} tCO₂e Saved</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            {onAcceptMatch && (
              <button
                type="button"
                onClick={() => {
                  onAcceptMatch()
                  onClose()
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Request Collection Offtake</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
