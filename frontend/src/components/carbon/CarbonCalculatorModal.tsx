import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
  TreePine,
  Car,
  Sparkles,
} from 'lucide-react'
import {
  calculateCarbonImpact,
  type ConversionPathwayType,
  WASTE_CARBON_FACTORS,
} from '../../utils/carbonEngine'
import { AIPathwayCard } from './AIPathwayCard'

interface CarbonCalculatorModalProps {
  initialWasteType?: string
  initialQuantity?: number
  initialDistance?: number
  onClose: () => void
}

export const CarbonCalculatorModal: React.FC<CarbonCalculatorModalProps> = ({
  initialWasteType = 'agricultural',
  initialQuantity = 100,
  initialDistance = 45,
  onClose,
}) => {
  const [wasteType, setWasteType] = useState<string>(initialWasteType)
  const [quantityTons, setQuantityTons] = useState<number>(initialQuantity)
  const [pathway, setPathway] = useState<ConversionPathwayType>('biochar')
  const [distanceKm, setDistanceKm] = useState<number>(initialDistance)
  const [moisturePercent, setMoisturePercent] = useState<number>(15)
  const [showMethodology, setShowMethodology] = useState<boolean>(false)
  const [showAIRecs, setShowAIRecs] = useState<boolean>(true)

  // Calculate live results via scientific engine
  const result = calculateCarbonImpact({
    wasteType,
    quantityTons,
    distanceKm,
    pathway,
    moisturePercent,
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Waste2Carbon Scientific Accounting Model
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-white">
              Transparent Carbon Impact Calculator
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Calculate verified emissions reductions using documented IPCC solid waste decay, Verra VM0044 durable biochar stoichiometry, and DEFRA transport factors.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Top 2 Columns: Interactive Controls & Live Scoreboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls: 6 Cols */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                Simulation Feedstock Inputs
              </h3>

              {/* Waste Type Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Waste Classification</label>
                <select
                  value={wasteType}
                  onChange={(e) => {
                    const newType = e.target.value
                    setWasteType(newType)
                    if (WASTE_CARBON_FACTORS[newType]) {
                      setMoisturePercent(WASTE_CARBON_FACTORS[newType].defaultMoisture)
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="agricultural">Agricultural Residues (Rice Husk, Straw, Bagasse)</option>
                  <option value="food">Commercial &amp; Hotel Food Organics</option>
                  <option value="manure">Livestock &amp; Dairy Manure</option>
                  <option value="industrial_organic">Industrial Bio-Processing Sludge &amp; Pulp</option>
                </select>
              </div>

              {/* Conversion Pathway Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Conversion Pathway</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'biochar', label: 'Slow Pyrolysis (Biochar)', sub: 'High Durability' },
                    { id: 'biogas', label: 'Biomethanation (Biogas)', sub: 'Grid Replacement' },
                    { id: 'biomethane', label: 'Purified Biomethane', sub: 'Bio-CNG Fuel' },
                    { id: 'compost', label: 'Aerobic Composting', sub: 'Humic Soil C' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPathway(p.id as ConversionPathwayType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        pathway === p.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-200 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Pathway Recommendation Advisor Widget (§AI USP) */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-heading">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>AI Waste Pathway Advisor</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAIRecs(!showAIRecs)}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer font-semibold"
                  >
                    {showAIRecs ? 'Hide Recommendations' : 'Show Recommendations'}
                  </button>
                </div>
                {showAIRecs && (
                  <AIPathwayCard
                    input={{
                      wasteType,
                      quantityTons,
                      distanceKm,
                      moisturePercent,
                    }}
                    selectedPathway={pathway}
                    onSelectPathway={(p) => setPathway(p)}
                    showTitle={false}
                    compact={true}
                  />
                )}
              </div>

              {/* Quantity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700">Feedstock Quantity</label>
                  <span className="font-extrabold text-emerald-700 font-mono">{quantityTons} Metric Tonnes</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={500}
                  step={1}
                  value={quantityTons}
                  onChange={(e) => setQuantityTons(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 ton</span>
                  <span>250 tons</span>
                  <span>500 tons</span>
                </div>
              </div>

              {/* Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700">Logistics Transport Radius</label>
                  <span className="font-extrabold text-slate-800 font-mono">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5 km (Local)</span>
                  <span>100 km</span>
                  <span>200 km (Regional)</span>
                </div>
              </div>

              {/* Moisture Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700">Moisture Content</label>
                  <span className="font-extrabold text-slate-800 font-mono">{moisturePercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={85}
                  step={1}
                  value={moisturePercent}
                  onChange={(e) => setMoisturePercent(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Side: 5-Step Model Output (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                5-Step Algorithmic Impact Ledger
              </h3>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
                {/* Net Benefit Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Estimated Net Carbon Reduction
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-heading">
                        {result.netCO2eBenefit}
                      </span>
                      <span className="text-sm font-bold text-slate-200">tCO₂e Net</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 block">Carbon Credits</span>
                    <span className="text-xl font-extrabold text-white font-heading">
                      {result.carbonCreditsIssued} Credits
                    </span>
                  </div>
                </div>

                {/* 5 Sequential Calculation Steps */}
                <div className="space-y-2 text-xs">
                  {/* Step 1: Avoided Landfill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-0.5">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>1. Avoided Landfill Methane Decay</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {quantityTons}t × {result.assumptions.baselineFactorTCO2ePerTon} tCO₂e/t baseline factor
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{result.landfillBaselineAvoidedTCO2e} tCO₂e
                    </span>
                  </div>

                  {/* Step 2: Durable Carbon Storage */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-0.5">
                      <div className="font-bold text-teal-300 flex items-center gap-1.5">
                        <span>2. Durable Carbon Storage / Gas Offset</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Biochar 44/12 stoichiometric fix ({result.assumptions.stableFractionPercent}% stable C)
                      </p>
                    </div>
                    <span className="text-sm font-bold text-teal-400 font-mono">
                      +{result.carbonStoredDurableTCO2e} tCO₂e
                    </span>
                  </div>

                  {/* Step 3: Transportation Emissions */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>3. Logistics Transit Deduction</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {distanceKm} km × {quantityTons}t × 0.000162 tCO₂e/t-km diesel factor
                      </p>
                    </div>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      -{result.transportEmissionsTCO2e} tCO₂e
                    </span>
                  </div>

                  {/* Step 4: Facility Processing Emissions */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-0.5">
                      <div className="font-bold text-red-300 flex items-center gap-1.5">
                        <span>4. Conversion Energy Deduction</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Thermal heating &amp; parasitic electrical load emissions
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-400 font-mono">
                      -{result.processingEmissionsTCO2e} tCO₂e
                    </span>
                  </div>

                  {/* Step 5: Net Balance Formula */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center font-mono text-xs text-emerald-200">
                    Net = {result.landfillBaselineAvoidedTCO2e} + {result.carbonStoredDurableTCO2e} - {result.transportEmissionsTCO2e} - {result.processingEmissionsTCO2e} = <strong className="text-white">{result.netCO2eBenefit} tCO₂e</strong>
                  </div>
                </div>

                {/* Real-World Equivalence Counters */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white/5 flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tree Equivalent</span>
                      <strong className="text-xs text-white">~{result.equivalentTreesPlanted} trees/yr</strong>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 flex items-center gap-2">
                    <Car className="h-5 w-5 text-teal-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vehicle Days</span>
                      <strong className="text-xs text-white">~{result.carsRemovedOffRoadDays} car-days off road</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Methodology & Factor Sources Collapsible Accordion (§24) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Scientific Methodology, Formulas &amp; Standards (§7 &amp; §24)
                </span>
              </div>
              {showMethodology ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>

            {showMethodology && (
              <div className="p-5 border-t border-slate-200 text-xs text-slate-600 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Carbon Storage Stoichiometry:</h4>
                    <p className="leading-relaxed">
                      For biochar, carbon stored is computed as:
                      <code className="block p-1.5 rounded bg-slate-100 font-mono text-[11px] my-1 text-emerald-800">
                        Carbon Stored = Biochar Yield × 75% Carbon × 80% Stable × (44/12)
                      </code>
                      where 44/12 represents the stoichiometric molecular mass ratio of CO₂ (44) to elemental Carbon (12).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">IPCC Landfill Baseline Avoidance:</h4>
                    <p className="leading-relaxed">
                      Avoided baseline emissions represent methane ($CH_4$) otherwise released from anaerobic solid waste decay in municipal dumps, with a 100-year Global Warming Potential (GWP) of 28.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-800 block mb-1">Documented Standards:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-500">
                    {result.assumptions.standards.map((std, i) => (
                      <li key={i}>{std}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
