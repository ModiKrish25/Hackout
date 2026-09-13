import React, { useState, useEffect } from 'react'
import {
  FileText,
  Sparkles,
  Layers,
  Building2,
  Navigation,
  Truck,
  Flame,
  Calculator,
  Award,
  ShieldCheck,
  CheckCircle2,
  Play,
  Pause,
  ChevronRight,
  ExternalLink,
  Cpu,
} from 'lucide-react'
import { BatchTrackingModal } from '../tracking/BatchTrackingModal'
import { MatchScoreBreakdownModal } from '../matching/MatchScoreBreakdownModal'
import { CarbonCalculatorModal } from '../carbon/CarbonCalculatorModal'
import { CarbonCertificateModal } from '../carbon/CarbonCertificateModal'
import { useNavigate } from 'react-router-dom'

interface PipelineStep {
  id: string
  stepNumber: number
  title: string
  tagline: string
  highlightBadge: string
  icon: React.ElementType
  color: string
  formulaOrLogic: string
  description: string
  inputPayload: string
  outputArtifact: string
  actionLabel?: string
  actionType?: 'qr' | 'match' | 'vrp' | 'calc' | 'cert' | 'municipal'
}

export const ARCHITECTURE_STEPS: PipelineStep[] = [
  {
    id: 'listing',
    stepNumber: 1,
    title: 'Waste Generator Listing',
    tagline: 'Farmgate, Agro-Processor, or Food Factory logs feedstock assays',
    highlightBadge: 'Generates Batch ID W2C-2026-XXXX + QR Code',
    icon: FileText,
    color: 'emerald',
    formulaOrLogic: 'Batch ID W2C-2026-XXXX + Deterministic SVG QR Code Generation',
    description:
      'Producers register waste streams with chemical moisture assay, tonnage payload, pickup coordinates, and contamination inspection. A deterministic SVG QR code and immutable serial ID are minted.',
    inputPayload: 'Feedstock assay (Crop Stubble / Food Scrap / Manure), Volume: 25 Tons, Moisture: 18%',
    outputArtifact: 'Batch Serial W2C-2026-000101 + Deterministic SVG QR Code Manifest',
    actionLabel: 'Preview Batch QR & Tracker',
    actionType: 'qr',
  },
  {
    id: 'matching',
    stepNumber: 2,
    title: 'Smart Matching Engine',
    tagline: 'Algorithmic multi-objective matching between generator and bio-refinery',
    highlightBadge: 'Compatibility 35%, Distance 25%, Cost 15%, Capacity 15%, Carbon 10%',
    icon: Layers,
    color: 'teal',
    formulaOrLogic: 'Weighted Score = (0.35 * Purity) + (0.25 * Proximity) + (0.15 * Cost) + (0.15 * Capacity) + (0.10 * Carbon)',
    description:
      'The matching engine scores candidate processing facilities using 5 weighted criteria: Feedstock Compatibility (35%), Logistics Distance (25%), Processing Cost (15%), Facility Intake Capacity (15%), and Carbon Sequestration Potential (10%).',
    inputPayload: 'Batch W2C-2026-000101 vs 4 Candidate Regional Facilities within 35 km',
    outputArtifact: 'Ranked Fit Matrix (e.g. BioVeda Hub: 94% Compatibility Fit)',
    actionLabel: 'Inspect 5-Factor Score Breakdown',
    actionType: 'match',
  },
  {
    id: 'offtake',
    stepNumber: 3,
    title: 'Facility Offtake Binding',
    tagline: 'Digitally signed commercial off-take contract and delivery schedule',
    highlightBadge: 'Automated Commercial Agreement',
    icon: Building2,
    color: 'blue',
    formulaOrLogic: 'Contract Bound: Guaranteed Off-Take Price (₹850/t) + Queue Reservation',
    description:
      'The selected processing facility accepts the candidate feedstock into their intake queue, reserving daily digester or pyrolysis pit buffer and locking in off-take compensation for the generator.',
    inputPayload: 'Accepted Fit Proposal @ ₹850/Ton off-take compensation',
    outputArtifact: 'Binding Off-Take Contract #BC-2026-88 + Scheduled Dispatch Window',
    actionLabel: 'View Facility Dispatch Queue',
    actionType: 'vrp',
  },
  {
    id: 'routing',
    stepNumber: 4,
    title: 'Logistics & VRP Route Optimization',
    tagline: 'Traveling Salesman Problem (TSP) dynamic multi-stop dispatch loop',
    highlightBadge: 'Calculates Distance & Fuel Savings',
    icon: Navigation,
    color: 'indigo',
    formulaOrLogic: 'Calculates Distance & Fuel Savings (TSP Closed Loop vs Unoptimized Direct Trips)',
    description:
      'Solves the multi-stop pickup vehicle routing problem (VRP) to eliminate empty backhaul miles. Compares consolidated multi-stop TSP routing against point-to-point direct trips, quantifying avoided fuel and transport emissions.',
    inputPayload: '4 Doorstep Farm Pickup Nodes + Central Depot Anchor (Depot -> N1 -> N2 -> N3 -> Depot)',
    outputArtifact: 'Optimized Turn-by-Turn GPS Polyline: 78.4 km (-40.5% distance reduction, -39.9 kg CO2e)',
    actionLabel: 'Inspect VRP Fuel Savings Benchmark',
    actionType: 'vrp',
  },
  {
    id: 'transport',
    stepNumber: 5,
    title: 'Batch Transport Chain-of-Custody',
    tagline: 'Door-to-door transit telemetry with weighbridge gross/tare manifest',
    highlightBadge: 'Scheduled -> Picked Up -> In Transit',
    icon: Truck,
    color: 'purple',
    formulaOrLogic: 'Chain of Custody: SCHEDULED -> PICKED_UP -> IN_TRANSIT -> RECEIVED',
    description:
      'GPS-tracked EV / commercial cargo trucks verify farmgate arrival, record weighbridge tare weights, and transmit live telemetry through the 10-stage chain of custody.',
    inputPayload: 'Electric Cargo Truck #KA-04-EV-9821, Driver: Ramesh Kumar, Tare: 3.2t, Gross: 28.2t',
    outputArtifact: 'Certified Weighbridge Manifest + Real-Time Geofenced Waypoint Logs',
    actionLabel: 'Track 10-Stage Batch Flow',
    actionType: 'qr',
  },
  {
    id: 'processing',
    stepNumber: 6,
    title: 'Facility Processing & Valorization',
    tagline: 'Anaerobic digestion, pyrolysis, or biomethanation valorization',
    highlightBadge: 'Received -> Biochar/Biogas Conversion',
    icon: Flame,
    color: 'amber',
    formulaOrLogic: 'Biomass Pit Loading -> High-Temperature Pyrolysis / Mesophilic Digestion',
    description:
      'Raw organic biomass is received, QA-inspected for inorganic contaminants, and loaded into conversion reactors. Pyrolysis produces stable biochar with >75% fixed carbon; digesters generate high-methane biogas.',
    inputPayload: '25 Tons Agricultural Stubble processed @ 550°C slow pyrolysis',
    outputArtifact: '7.5 Tons Stable Biochar + 1,200 kWh Clean Syngas Power Output',
    actionLabel: 'Launch Carbon Calculator',
    actionType: 'calc',
  },
  {
    id: 'carbon_engine',
    stepNumber: 7,
    title: '5-Step Transparent Carbon Engine',
    tagline: 'Scientific carbon accounting model adhering to IPCC Tier 2 & Verra VM0044',
    highlightBadge: 'Avoided + Storage - Transport - Processing',
    icon: Calculator,
    color: 'emerald',
    formulaOrLogic: 'Net CO2e = Q*EF_landfill + Biochar*C*(44/12) - D*2*EF_truck - Q*EF_process',
    description:
      'Computes empirical net carbon benefit: Step 1 (Avoided Landfill Methane Baseline) + Step 2 (Durable Sequestration Storage with 44/12 stoichiometry) - Step 3 (Transport Logistics Deduction) - Step 4 (Processing Energy Deduction) = Step 5 (Net Verified CO2e Benefit).',
    inputPayload: 'Avoided: +20.5 tCO2e, Storage: +16.5 tCO2e, Transport: -0.06 tCO2e, Processing: -0.38 tCO2e',
    outputArtifact: 'Net Carbon Benefit: +36.56 tCO2e Verified High-Permanence Offset',
    actionLabel: 'Open 5-Step Simulator',
    actionType: 'calc',
  },
  {
    id: 'certificate',
    stepNumber: 8,
    title: 'Digital Carbon Certificate',
    tagline: 'Printable & downloadable verifiable credit minting with digital signatures',
    highlightBadge: 'Digital Carbon Certificate + QR Verification',
    icon: Award,
    color: 'emerald',
    formulaOrLogic: 'Tamper-Proof SHA-256 Hash + Dual Authorized Cryptographic Signatures',
    description:
      'Generates an official verifiable carbon credit certificate featuring a unique certificate serial, certified batch ID, dual signatures (Chief Verra Verifier & Generator), and tamper-evident QR code watermark.',
    inputPayload: 'Batch W2C-2026-000101, +36.56 tCO2e Net Credit, Issuance Standard: Verra VM0044',
    outputArtifact: 'Certificate #W2C-CERT-2026-001019 with Cryptographic Ledger Seal',
    actionLabel: 'View Verifiable Certificate',
    actionType: 'cert',
  },
  {
    id: 'registry',
    stepNumber: 9,
    title: 'Municipal Command Audit & Registry',
    tagline: 'Regional circular economy oversight, landfill diversion ledger & ESG export',
    highlightBadge: 'Municipal Command Audit & Carbon Registry',
    icon: ShieldCheck,
    color: 'blue',
    formulaOrLogic: 'Municipal Aggregation: Total Tons Diverted + EPA Passenger Vehicle Equivalence',
    description:
      'Environmental authorities and municipal leaders track regional diversion compliance, view real-time geospatial waste heatmaps, review immutable audit ledgers, and export Gold Standard / Verra compliance CSVs.',
    inputPayload: 'Cumulative 1,420 Tons diverted, 2,101 tCO2e baseline avoided, 456 cars off the road',
    outputArtifact: 'Government Environmental Audit Ledger & Automated CSV Export Pipeline',
    actionLabel: 'Access Municipal Registry',
    actionType: 'municipal',
  },
]

export const ArchitecturePipelineSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const navigate = useNavigate()

  // Interactive Demo Modal states
  const [showQRModal, setShowQRModal] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showCalcModal, setShowCalcModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)

  // Auto-advancement loop when "Play Flow" is enabled
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % ARCHITECTURE_STEPS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPlaying])

  const activeStep = ARCHITECTURE_STEPS[activeStepIndex]
  const progressPercent = Math.round(((activeStepIndex + 1) / ARCHITECTURE_STEPS.length) * 100)

  const handleStepAction = (type?: string) => {
    if (type === 'qr') setShowQRModal(true)
    else if (type === 'match') setShowMatchModal(true)
    else if (type === 'calc') setShowCalcModal(true)
    else if (type === 'cert') setShowCertModal(true)
    else if (type === 'vrp') navigate('/facility/routes/' + new Date().toISOString().split('T')[0])
    else if (type === 'municipal') navigate('/municipal/reports')
  }

  return (
    <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-800/80 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Title with Play/Pause Auto-Tour Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              Proposed Architectural Enhancements &amp; Value Chain Pipeline
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
              Waste2Carbon End-to-End System Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore the 9 foundational architectural stages: from feedstock listing to 5-factor matching, TSP logistics, 5-step carbon accounting, and certified municipal registry.
            </p>
          </div>

          {/* Autoplay & Progress indicators */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
              <span>Pipeline Stage:</span>
              <span className="font-mono font-bold text-emerald-400">{activeStepIndex + 1} / 9</span>
              <span className="text-slate-500">({progressPercent}%)</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25'
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Auto Tour' : 'Play Interactive Tour'}</span>
            </button>
          </div>
        </div>

        {/* Global Pipeline Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Horizontal Step Pill Navigation - Hidden Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ARCHITECTURE_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx
            const isPassed = activeStepIndex > idx
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false)
                  setActiveStepIndex(idx)
                }}
                className={`group px-3.5 py-2 rounded-xl border text-left flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/30 scale-[1.03]'
                    : isPassed
                    ? 'bg-slate-900/90 hover:bg-slate-850 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isSelected
                      ? 'bg-slate-950 text-white font-black'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.stepNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{step.title}</div>
                </div>
                {idx < ARCHITECTURE_STEPS.length - 1 && (
                  <ChevronRight
                    className={`h-3 w-3 shrink-0 ${
                      isSelected ? 'text-slate-950/70' : isPassed ? 'text-emerald-500/50' : 'text-slate-700'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Main Split Layout: Left Stage Card & Right Architecture Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: High-Contrast Dark Card with Emerald Highlights */}
          <div className="lg:col-span-8 rounded-3xl p-6 sm:p-8 bg-slate-900/95 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl space-y-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
            {/* Top decorative neon glow corner */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Animated Card Content (Keys to activeStep.id for smooth transition) */}
            <div key={activeStep.id} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/25 shrink-0">
                    <activeStep.icon className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                      <Cpu className="h-3 w-3" />
                      STAGE {activeStep.stepNumber} OF 9
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight drop-shadow-sm">
                      {activeStep.title}
                    </h3>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-2xs">
                  {activeStep.highlightBadge}
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm sm:text-base text-emerald-300/95 leading-relaxed font-semibold">
                {activeStep.tagline}
              </p>

              {/* Mathematical / Architectural Logic Formula Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 font-mono text-xs text-emerald-300 space-y-1.5 shadow-inner">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Core Algorithm / Engineering Mechanism:</span>
                </div>
                <div className="font-bold text-white break-words text-xs sm:text-sm bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {activeStep.formulaOrLogic}
                </div>
              </div>

              {/* Description Body with High Contrast White Text */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Data Ingestion & Artifact Produced Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Input Ingestion
                  </span>
                  <div className="text-slate-100 font-medium text-[11px] sm:text-xs leading-relaxed">
                    {activeStep.inputPayload}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5 text-xs shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Generated Artifact
                  </span>
                  <div className="text-emerald-200 font-medium text-[11px] sm:text-xs leading-relaxed">
                    {activeStep.outputArtifact}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation & Live Demo Action Buttons */}
            <div className="pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => {
                    setIsPlaying(false)
                    setActiveStepIndex((prev) => Math.max(0, prev - 1))
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed border border-slate-700"
                >
                  &larr; Prev Stage
                </button>
                <button
                  type="button"
                  disabled={activeStepIndex === ARCHITECTURE_STEPS.length - 1}
                  onClick={() => {
                    setIsPlaying(false)
                    setActiveStepIndex((prev) => Math.min(ARCHITECTURE_STEPS.length - 1, prev + 1))
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed border border-slate-700"
                >
                  Next Stage &rarr;
                </button>
              </div>

              {activeStep.actionLabel && (
                <button
                  type="button"
                  onClick={() => handleStepAction(activeStep.actionType)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>{activeStep.actionLabel}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Pipeline Architecture Graph with Crisp Dark Cards */}
          <div className="lg:col-span-4 rounded-3xl p-5 sm:p-6 bg-slate-900/95 border-2 border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>Architecture Graph</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                  LIVE PIPELINE
                </span>
              </div>

              {/* Vertical Step Nodes with High Contrast & Hover Animations */}
              <div className="space-y-2">
                {ARCHITECTURE_STEPS.map((s, idx) => {
                  const isCurrent = activeStepIndex === idx
                  const isPassed = activeStepIndex > idx
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setIsPlaying(false)
                        setActiveStepIndex(idx)
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-[1.02] font-bold'
                          : isPassed
                          ? 'bg-slate-900 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:text-white'
                          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isCurrent
                              ? 'bg-slate-950 text-white'
                              : isPassed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.stepNumber}
                        </div>
                        <span className="truncate font-semibold text-xs">{s.title}</span>
                      </div>

                      {isCurrent && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Action Button for Full Calculator */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowCalcModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700 shadow-sm hover:border-emerald-500/50"
              >
                <Calculator className="h-3.5 w-3.5 text-emerald-400" />
                <span>Test Interactive 5-Step Model</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Feature Modals for Live Demos */}
      {showQRModal && (
        <BatchTrackingModal
          batch={{
            batchId: 'W2C-2026-000101',
            listingId: 1,
            wasteType: 'Agricultural Residues (Paddy Straw)',
            quantityTons: 25.0,
            generatorName: 'Aarav Sharma (GreenAgro Farms)',
            facilityName: 'BioVeda Central Pyrolysis & Biochar Hub',
            facilityType: 'High-Temperature Pyrolysis',
            originAddress: 'Koramangala 4th Block, Rural Produce Corridor',
            destinationAddress: 'Rajajinagar Industrial Area, Bangalore',
            driverName: 'Ramesh Kumar (EV Heavy Carrier)',
            truckNumber: 'KA-04-EV-9821',
            distanceKm: 28.5,
            createdAt: '2026-09-12',
            currentStageIndex: 8,
          }}
          onClose={() => setShowQRModal(false)}
          onOpenCertificate={() => {
            setShowQRModal(false)
            setShowCertModal(true)
          }}
        />
      )}

      {showMatchModal && (
        <MatchScoreBreakdownModal
          details={{
            facilityName: 'BioVeda Central Bio-Refining Plant',
            facilityType: 'Pyrolysis & Anaerobic Digestion',
            generatorName: 'Aarav Sharma (GreenAgro Farms)',
            wasteType: 'Agricultural Crop Residues',
            quantityTons: 25.0,
            distanceKm: 8.5,
            overallScore: 94,
            compatibilityScore: 98,
            distanceScore: 92,
            processingCostScore: 89,
            capacityScore: 95,
            carbonBenefitScore: 96,
            offtakePricePerTon: 850,
            estimatedTransportCost: 1250,
            carbonBenefitTons: 36.56,
          }}
          onClose={() => setShowMatchModal(false)}
        />
      )}

      {showCalcModal && (
        <CarbonCalculatorModal
          initialWasteType="agricultural"
          initialQuantity={25}
          initialDistance={28}
          onClose={() => setShowCalcModal(false)}
        />
      )}

      {showCertModal && (
        <CarbonCertificateModal
          data={{
            certificateId: 'W2C-CERT-2026-001019',
            batchId: 'W2C-2026-000101',
            wasteType: 'Agricultural Crop Residues',
            quantityTons: 25.0,
            pathway: 'High-Temperature Pyrolysis (Biochar Valorization)',
            netCO2eTons: 36.56,
            landfillAvoidedTons: 20.5,
            carbonStoredTons: 16.5,
            generatorName: 'Aarav Sharma (GreenAgro Farms)',
            facilityName: 'BioVeda Central Bio-Refining Plant',
            issuanceDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            methodologyStandard: 'Verra VM0044 & CDM ACM0022 High-Permanence Biochar Method',
          }}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </section>
  )
}

export default ArchitecturePipelineSection
