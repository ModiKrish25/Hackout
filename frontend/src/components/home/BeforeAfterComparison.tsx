import React, { useState } from 'react'
import {
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Flame,
  TreePine,
  ShieldAlert,
  ShieldCheck,
  SplitSquareVertical,
  Columns2,
  Sliders,
} from 'lucide-react'

interface BeforeAfterComparisonProps {
  initialQuantity?: number
  className?: string
  showQuantitySlider?: boolean
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  initialQuantity = 100,
  className = '',
  showQuantitySlider = true,
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity)
  const [wasteType, setWasteType] = useState<'rice-husk' | 'sugarcane' | 'food-waste'>('rice-husk')
  const [viewMode, setViewMode] = useState<'split' | 'matrix'>('split')
  const [sliderPosition, setSliderPosition] = useState<number>(50) // 0 to 100%

  // Real-time calculations based on feedstock and tonnage
  const feedstockProfiles = {
    'rice-husk': {
      name: 'Rice Husk & Field Stubble',
      baselineMethanePerTon: 0.98, // tCO2e
      biocharYieldRatio: 0.32,
      tippingCostPerTon: 850, // INR
      valueUnlockedPerTon: 2450, // INR
      baselineKm: 51.8,
      optimizedKm: 42.4,
    },
    'sugarcane': {
      name: 'Sugarcane Bagasse',
      baselineMethanePerTon: 0.86,
      biocharYieldRatio: 0.28,
      tippingCostPerTon: 700,
      valueUnlockedPerTon: 2100,
      baselineKm: 60.0,
      optimizedKm: 48.0,
    },
    'food-waste': {
      name: 'Wholesale Food Waste',
      baselineMethanePerTon: 1.21,
      biocharYieldRatio: 0.18,
      tippingCostPerTon: 1100,
      valueUnlockedPerTon: 2800,
      baselineKm: 38.0,
      optimizedKm: 31.0,
    },
  }

  const profile = feedstockProfiles[wasteType]
  const baselineEmissions = Number((quantity * profile.baselineMethanePerTon).toFixed(1))
  const netSavedEmissions = Number((quantity * profile.baselineMethanePerTon * 0.84).toFixed(1))
  const biocharYieldTons = Number((quantity * profile.biocharYieldRatio).toFixed(1))
  const conventionalLossINR = quantity * profile.tippingCostPerTon
  const platformRevenueINR = quantity * profile.valueUnlockedPerTon
  const totalFinancialDeltaINR = conventionalLossINR + platformRevenueINR
  const dieselSavedLiters = Number(((profile.baselineKm - profile.optimizedKm) * 0.28 * Math.ceil(quantity / 16)).toFixed(1))

  return (
    <div className={`relative rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-8 overflow-hidden text-white shadow-2xl ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-48 bg-red-500/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              System Impact Visualizer
            </span>
            <span className="text-xs text-slate-400 font-mono">100t Feedstock Lifecycle Benchmark</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
            Conventional Disposal vs Waste2Carbon Closed Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            See the transformative difference between legacy dumping/stubble burning and our AI-routed, carbon-verified infrastructure.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            <span>Interactive Split Wipe</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            <span>Side-by-Side Matrix</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar: Feedstock Type & Quantity Slider */}
      {showQuantitySlider && (
        <div className="relative z-10 py-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Feedstock Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase text-[10px]">Biomass Feedstock:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setWasteType('rice-husk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  wasteType === 'rice-husk' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rice Husk (Punjab)
              </button>
              <button
                type="button"
                onClick={() => setWasteType('sugarcane')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  wasteType === 'sugarcane' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sugarcane (UP)
              </button>
              <button
                type="button"
                onClick={() => setWasteType('food-waste')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  wasteType === 'food-waste' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Food Waste (Delhi)
              </button>
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400 font-bold uppercase text-[10px]">Tonnage:</span>
              <span className="font-mono text-xs font-extrabold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {quantity} Metric Tons
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 sm:w-40 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 pt-6">
        {/* ========================================================================= */}
        {/* MODE 1: INTERACTIVE SPLIT WIPE SLIDER                                     */}
        {/* ========================================================================= */}
        {viewMode === 'split' && (
          <div className="space-y-6">
            {/* Split Wipe Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 min-h-[460px] select-none bg-slate-950">
              {/* Left Layer: Conventional Disposal (Full width background) */}
              <div className="absolute inset-0 p-6 sm:p-8 bg-gradient-to-br from-red-950/40 via-slate-950 to-amber-950/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                        Legacy Linear Disposal
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold font-heading text-red-200">
                        ❌ Open Dumping &amp; Stubble Burning
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 max-w-sm sm:max-w-md">
                    <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/20">
                      <span className="text-[10px] text-red-300 font-bold uppercase block">Runaway Climate Impact</span>
                      <strong className="text-xl font-extrabold text-red-400 font-mono">
                        +{baselineEmissions} tCO₂e Released
                      </strong>
                      <p className="text-xs text-slate-300 mt-1">
                        Methane decay (28&times; GWP) and toxic particulate matter ($PM_{2.5} &gt; 400 \mu g/m^3$) blanketing cities.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/20">
                      <span className="text-[10px] text-red-300 font-bold uppercase block">Economic Value Lost</span>
                      <strong className="text-xl font-extrabold text-red-400 font-mono">
                        -₹{conventionalLossINR.toLocaleString('en-IN')} Tipping Loss
                      </strong>
                      <p className="text-xs text-slate-300 mt-1">
                        Generators pay ₹{profile.tippingCostPerTon}/ton tipping fees with ₹0 economic return and high penalty liability.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/20">
                      <span className="text-[10px] text-red-300 font-bold uppercase block">Logistics &amp; Chain of Custody</span>
                      <strong className="text-sm font-bold text-slate-300 block">
                        Uncoordinated direct haul ({profile.baselineKm} km) &bull; Zero traceability
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        Prone to fraudulent dumping, no digital manifests, lost biomass records.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Legacy Paradigm &bull; Status Quo Benchmark
                </div>
              </div>

              {/* Right Layer: Waste2Carbon Platform (Clipped by slider position) */}
              <div
                className="absolute inset-0 p-6 sm:p-8 bg-gradient-to-br from-emerald-950/60 via-slate-950 to-teal-950/40 flex flex-col justify-between border-l-2 border-emerald-400/80 shadow-2xl transition-all duration-75"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                <div>
                  <div className="flex items-center gap-2 justify-end text-right">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                        Waste2Carbon Infrastructure
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold font-heading text-emerald-300">
                        ✅ Circular Biochar &amp; Carbon Economy
                      </h3>
                    </div>
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-4 max-w-sm sm:max-w-md ml-auto text-right">
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block">Net Carbon Benefit</span>
                      <strong className="text-xl font-extrabold text-emerald-400 font-mono">
                        +{netSavedEmissions} tCO₂e Sequestered
                      </strong>
                      <p className="text-xs text-slate-300 mt-1">
                        100+ year permanence biochar storage + avoided landfill methane audited via Verra VM0044.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block">Commercial Value Unlocked</span>
                      <strong className="text-xl font-extrabold text-emerald-400 font-mono">
                        +₹{platformRevenueINR.toLocaleString('en-IN')} Net Revenue
                      </strong>
                      <p className="text-xs text-slate-300 mt-1">
                        {biocharYieldTons}t premium biochar soil amendment + verifiable carbon credits sold to corporate buyers.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block">VRP Logistics &amp; Provenance</span>
                      <strong className="text-sm font-bold text-white block">
                        -18% Diesel Saved ({profile.optimizedKm} km) &bull; Digital Passport
                      </strong>
                      <span className="text-[11px] text-emerald-300/80">
                        Tamper-proof SVG QR tracking, GPS telemetric corridor, SHA-256 seal.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 font-mono text-right">
                  Waste2Carbon Architecture &bull; On-Chain &amp; Certified
                </div>
              </div>

              {/* Slider Handle Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-400 pointer-events-none shadow-lg shadow-emerald-500/50"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-emerald-500 border-2 border-white text-slate-950 shadow-2xl flex items-center justify-center font-extrabold text-xs">
                  &harr;
                </div>
              </div>

              {/* Slider Interactive Range Input */}
              <input
                type="range"
                min="5"
                max="95"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                aria-label="Drag comparison slider"
              />
            </div>

            {/* Slider Drag Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
              <span className="flex items-center gap-1 text-red-400">
                &larr; Drag left to view Waste2Carbon Platform
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {sliderPosition}% Comparison Split
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                Drag right to view Legacy Dumping &rarr;
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: SIDE-BY-SIDE MATRIX                                               */}
        {/* ========================================================================= */}
        {viewMode === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Column 1: Conventional Linear Economy */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-red-500/20 space-y-5">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                    Conventional Method
                  </span>
                  <h3 className="text-base font-extrabold font-heading text-red-300">
                    Open Dumps &amp; Stubble Fires
                  </h3>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Atmospheric Fate</span>
                    <strong className="text-red-400 font-mono">+{baselineEmissions} tCO₂e</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Uncontrolled biological anaerobic decay releasing methane gas ($CH_4$) with 28&times; the global warming potential of carbon dioxide.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Financial Impact</span>
                    <strong className="text-red-400 font-mono">-₹{conventionalLossINR.toLocaleString('en-IN')} Lost</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Generators pay municipal dumping penalties or tipping fees with zero asset recovery or secondary product monetisation.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Logistics Route</span>
                    <strong className="text-slate-300 font-mono">{profile.baselineKm} km haul</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Direct single-trip haul without consolidation. High fuel burn, empty backhauls, and unmitigated road transport emissions.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Compliance &amp; Provenance</span>
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Zero Traceability
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Paper receipts, no weighbridge assays, no chain of custody, and persistent greenwashing audit vulnerability.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Waste2Carbon Solution */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-5">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <TreePine className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    Waste2Carbon Closed Loop
                  </span>
                  <h3 className="text-base font-extrabold font-heading text-emerald-300">
                    Industrial Biochar &amp; Carbon Ledger
                  </h3>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Atmospheric Fate</span>
                    <strong className="text-emerald-400 font-mono">+{netSavedEmissions} tCO₂e Saved</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    High-temperature slow pyrolysis fixes pure carbon into durable biochar matrix with &gt;100-year verified permanence.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Financial Impact</span>
                    <strong className="text-emerald-400 font-mono">+₹{platformRevenueINR.toLocaleString('en-IN')} Unlocked</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Revenue generated from certified biochar soil conditioner sales plus tradeable Verra VM0044 carbon credits.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Logistics Route</span>
                    <strong className="text-emerald-400 font-mono">-18% Distance &bull; {dieselSavedLiters}L Saved</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    AI-powered Vehicle Routing Problem (VRP) solver clusters regional feedstock stops, minimizing diesel and deadhead transit.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Compliance &amp; Provenance</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Digital Passport (QR &bull; SHA-256)
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    End-to-end digital product passport with departure weighbridge assays, GPS logs, and cryptographically verified certificates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Delta KPI Summary Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-teal-950/60 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider font-mono">
                Total Net Value Differential ({quantity}t {profile.name}):
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                  +{netSavedEmissions} tCO₂e Carbon Benefit
                </span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  &bull; +₹{totalFinancialDeltaINR.toLocaleString('en-IN')} Economic Turnaround
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              ⚡ {dieselSavedLiters} L Diesel Saved
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
              100% Landfill Diverted
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
