import React, { useState } from 'react'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Leaf,
  Flame,
  Zap,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import {
  analyzeWastePathway,
  type AIPathwayAnalysisResult,
  type AIPathwayInput,
} from '../../utils/aiPathwayEngine'
import type { ConversionPathwayType } from '../../utils/carbonEngine'

interface AIPathwayCardProps {
  input: AIPathwayInput
  selectedPathway?: ConversionPathwayType
  onSelectPathway?: (pathway: ConversionPathwayType) => void
  showTitle?: boolean
  compact?: boolean
  className?: string
}

export const AIPathwayCard: React.FC<AIPathwayCardProps> = ({
  input,
  selectedPathway,
  onSelectPathway,
  showTitle = true,
  compact = false,
  className = '',
}) => {
  const [expandedPathway, setExpandedPathway] = useState<ConversionPathwayType | null>(null)
  const [showAllRankings, setShowAllRankings] = useState<boolean>(!compact)

  // Run the AI algorithm live
  const analysis: AIPathwayAnalysisResult = analyzeWastePathway(input)
  const activePathway = selectedPathway || analysis.primaryRecommendation.pathwayId

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇 #1 AI Recommended'
      case 2:
        return '🥈 #2 Secondary Fate'
      case 3:
        return '🥉 #3 Alternative'
      default:
        return `#${rank} Option`
    }
  }

  const getPathwayIcon = (id: ConversionPathwayType) => {
    switch (id) {
      case 'biochar':
        return <Flame className="h-4 w-4 text-emerald-400" />
      case 'biogas':
        return <Zap className="h-4 w-4 text-amber-400" />
      case 'biomethane':
        return <TrendingUp className="h-4 w-4 text-teal-400" />
      case 'compost':
        return <Leaf className="h-4 w-4 text-lime-400" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with AI Badge */}
      {showTitle && (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-sm">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-heading">
                AI Waste Pathway Recommendation
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Evaluated {analysis.quantityTons}t of {analysis.feedstockName} across biochemical lignin density, moisture, and carbon permanence.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
            {analysis.primaryRecommendation.matchConfidence}% Optimal Match
          </span>
        </div>
      )}

      {/* AI Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed shadow-sm">
        <strong className="text-emerald-300 font-semibold flex items-center gap-1.5 mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Automated Conversion Fate Analysis:</span>
        </strong>
        {analysis.aiSummary}
      </div>

      {/* Pathway Recommendation Cards */}
      <div className="space-y-3">
        {analysis.allRecommendations
          .slice(0, showAllRankings ? 4 : 1)
          .map((rec) => {
            const isSelected = activePathway === rec.pathwayId
            const isExpanded = expandedPathway === rec.pathwayId

            return (
              <div
                key={rec.pathwayId}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  rec.isPrimary
                    ? isSelected
                      ? 'bg-emerald-950/40 border-emerald-400/80 shadow-lg ring-2 ring-emerald-500/30'
                      : 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                    : isSelected
                    ? 'bg-slate-800/80 border-teal-400 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Main Card Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => onSelectPathway?.(rec.pathwayId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Rank Badge & Title */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                            rec.isPrimary
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {getRankBadge(rec.rank)}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white font-heading flex items-center gap-1.5">
                          {getPathwayIcon(rec.pathwayId)}
                          <span>{rec.name}</span>
                        </h4>
                      </div>

                      {/* Scientific Rationale Summary */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rec.scientificRationale}
                      </p>

                      {/* Comparison Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {rec.comparisonTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Confidence Score & Select Action */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                          {rec.matchConfidence}%
                        </span>
                        <span className="text-[10px] text-slate-400">Match</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold block bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        +{rec.carbonYieldTCO2e} tCO₂e
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-400 block">Carbon Potential</span>
                      <strong className="text-emerald-300 font-semibold">{rec.carbonPotential}</strong>
                    </div>

                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-400 block">Permanence Duration</span>
                      <strong className="text-teal-300 font-semibold truncate block" title={rec.permanenceRating}>
                        {rec.permanenceRating.split(' ')[0]}
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-400 block">Est. Revenue</span>
                      <strong className="text-white font-mono">₹{rec.economicReturnINR.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-400 block">Offtake Rate</span>
                      <strong className="text-amber-300 font-mono">₹{rec.pricePerTonINR}/t</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Drawer Toggle & Select CTA */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedPathway(isExpanded ? null : rec.pathwayId)
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Specifications' : 'View Specifications & Equipment'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {onSelectPathway && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectPathway(rec.pathwayId)
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                          <span>Selected Pathway</span>
                        </>
                      ) : (
                        <>
                          <span>Select This Pathway</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Collapsible Technical Specifications Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Recommended Conversion Equipment
                      </span>
                      <p className="text-slate-200 font-mono text-[11px] mt-0.5">{rec.recommendedEquipment}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Market Commodity Generated
                      </span>
                      <p className="text-slate-200 text-[11px] mt-0.5">{rec.marketCommodity}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                          Key Strengths (Pros)
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-300">
                          {rec.pros.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">&bull;</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">
                          Considerations (Cons)
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-400">
                          {rec.cons.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400">&bull;</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* Show All / Collapse Toggle */}
      {compact && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAllRankings(!showAllRankings)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
          >
            {showAllRankings ? 'Show Only Primary Recommendation ↑' : 'Show All Ranked Alternative Pathways (4) ↓'}
          </button>
        </div>
      )}
    </div>
  )
}

export default AIPathwayCard
