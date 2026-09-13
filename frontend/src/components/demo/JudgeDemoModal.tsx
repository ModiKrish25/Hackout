import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Truck,
  Award,
  Leaf,
  Flame,
  TreePine,
  Car,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Check,
  Navigation,
  Gauge,
} from 'lucide-react'
import { QRCodeGenerator } from '../shared/QRCodeGenerator'
import { CarbonCertificateModal, type CertificateData } from '../carbon/CarbonCertificateModal'
import { DigitalPassportModal, type DigitalPassportData } from '../tracking/DigitalPassportModal'
import { calculateCarbonImpact, type ConversionPathwayType } from '../../utils/carbonEngine'
import { AIPathwayCard } from '../carbon/AIPathwayCard'
import { AnimatedRouteMap } from '../map/AnimatedRouteMap'
import toast from 'react-hot-toast'

interface JudgeDemoModalProps {
  onClose: () => void
  initialStep?: number
}

// Preset feedstocks for instant judge testing
interface FeedstockPreset {
  id: string
  name: string
  region: string
  quantity: number
  moisture: number
  type: string
  description: string
  baselineMethane: number // tCO2e if dumped
  originCoords: [number, number]
  originName: string
}

const FEEDSTOCK_PRESETS: FeedstockPreset[] = [
  {
    id: 'rice-husk',
    name: 'Rice Husk & Crop Stubble',
    region: 'Khanna Agro Cluster, Punjab',
    quantity: 100,
    moisture: 14,
    type: 'agricultural',
    description: 'High-silica, low-moisture crop residues commonly open-burned across Northern India.',
    baselineMethane: 98.0,
    originCoords: [30.7046, 76.2219],
    originName: 'Khanna Farm Gate #4, Punjab',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane Bagasse & Tops',
    region: 'Muzaffarnagar Sugar Belt, UP',
    quantity: 250,
    moisture: 28,
    type: 'agricultural',
    description: 'Dense fibrous lignocellulosic residue from regional sugar crushing mills.',
    baselineMethane: 215.0,
    originCoords: [29.4727, 77.7085],
    originName: 'Western UP Sugar Collective',
  },
  {
    id: 'food-waste',
    name: 'Commercial Food & Vegetable Waste',
    region: 'Azadpur Mandi Wholesale Market, Delhi',
    quantity: 45,
    moisture: 65,
    type: 'food',
    description: 'High-moisture, fast-degrading organic waste prone to immediate anaerobic dump decay.',
    baselineMethane: 54.5,
    originCoords: [28.7162, 77.1772],
    originName: 'Delhi Wholesale Organics Terminal',
  },
  {
    id: 'dairy-manure',
    name: 'Livestock & Dairy Manure Slurry',
    region: 'Karnal Dairy Belt, Haryana',
    quantity: 120,
    moisture: 72,
    type: 'manure',
    description: 'Nitrogen-rich manure slurry with high fugitive methane leakage in open lagoons.',
    baselineMethane: 132.0,
    originCoords: [29.6857, 76.9905],
    originName: 'Karnal Livestock Cooperative #12',
  },
]

// Animated Route Waypoints from Khanna Farm to Ludhiana Biochar Plant (42.4 km)
const ROUTE_WAYPOINTS = [
  { lat: 30.7046, lng: 76.2219, name: 'Khanna Farm Gate (Origin)', distanceKm: 0.0, status: 'Departed' },
  { lat: 30.7421, lng: 76.1345, name: 'NH-44 Highway Toll Plaza', distanceKm: 12.2, status: 'In Transit' },
  { lat: 30.8115, lng: 75.9812, name: 'Doraha Industrial Flyover', distanceKm: 27.5, status: 'In Transit' },
  { lat: 30.8752, lng: 75.8950, name: 'Ludhiana South Outer Ring', distanceKm: 38.1, status: 'Approaching' },
  { lat: 30.9010, lng: 75.8573, name: 'Ludhiana Biochar Carbon Sink', distanceKm: 42.4, status: 'Arrived' },
]

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  onClose,
  initialStep = 1,
}) => {
  // Navigation & Mode
  const [currentStep, setCurrentStep] = useState<number>(initialStep) // 1 to 4
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false)
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(12) // 12 seconds per step

  // Step 1 State: Feedstock Selection
  const [selectedPreset, setSelectedPreset] = useState<FeedstockPreset>(FEEDSTOCK_PRESETS[0])
  const [customQuantity, setCustomQuantity] = useState<number>(100)
  const [selectedPathway, setSelectedPathway] = useState<ConversionPathwayType>('biochar')

  // Step 3 State: Route Animation
  const [transitProgress, setTransitProgress] = useState<number>(0) // 0 to 100%
  const [isTruckMoving, setIsTruckMoving] = useState<boolean>(true)
  const [transitSpeed, setTransitSpeed] = useState<number>(1) // 1x, 2x, 4x
  const [mapViewMode, setMapViewMode] = useState<'leaflet' | 'hud'>('leaflet')

  // Step 4 State: Verified Certificate and Digital Passport Modals
  const [showCertModal, setShowCertModal] = useState<boolean>(false)
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false)

  // Calculate live carbon metrics based on selected feedstock and AI pathway
  const carbonMetrics = calculateCarbonImpact({
    wasteType: selectedPreset.type,
    quantityTons: customQuantity,
    distanceKm: 42.4,
    pathway: selectedPathway,
    moisturePercent: selectedPreset.moisture,
  })

  // Auto-play timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay) {
      interval = setInterval(() => {
        setAutoPlayTimer((prev) => {
          if (prev <= 1) {
            // Advance to next step
            setCurrentStep((curr) => {
              if (curr >= 4) {
                setIsAutoPlay(false)
                return 4
              }
              return curr + 1
            })
            return 12
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlay])

  // Reset auto timer when step manually changes
  useEffect(() => {
    setAutoPlayTimer(12)
    if (currentStep === 3) {
      setTransitProgress(0)
      setIsTruckMoving(true)
    }
  }, [currentStep])

  // Truck transit animation in Step 3
  useEffect(() => {
    if (currentStep === 3 && isTruckMoving) {
      const stepIncrement = 0.4 * transitSpeed
      const interval = setInterval(() => {
        setTransitProgress((prev) => {
          if (prev >= 100) {
            setIsTruckMoving(false)
            return 100
          }
          return prev + stepIncrement
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [currentStep, isTruckMoving, transitSpeed])

  // Telemetry derived from transit progress
  const totalKm = 42.4
  const currentKm = Math.min(totalKm, Number(((transitProgress / 100) * totalKm).toFixed(1)))
  const fuelUsedLiters = Number(((currentKm / totalKm) * 11.8).toFixed(1))
  const fuelSavedLiters = Number((fuelUsedLiters * 0.18).toFixed(1))

  // Interpolate current truck coordinates
  const currentWaypointIndex = Math.min(
    ROUTE_WAYPOINTS.length - 1,
    Math.floor((transitProgress / 100) * (ROUTE_WAYPOINTS.length - 1))
  )
  const currentWaypoint = ROUTE_WAYPOINTS[currentWaypointIndex]

  // Certificate data object for Step 4
  const certificateData: CertificateData = {
    certificateId: 'W2C-CERT-2026-PUNJAB01',
    batchId: 'W2C-2026-000124',
    wasteType: selectedPreset.name,
    quantityTons: customQuantity,
    pathway: 'Slow Pyrolysis (Biochar Sequestration)',
    netCO2eTons: carbonMetrics.netCO2eBenefit,
    landfillAvoidedTons: carbonMetrics.landfillBaselineAvoidedTCO2e,
    carbonStoredTons: carbonMetrics.carbonStoredDurableTCO2e,
    generatorName: 'Khanna Agro Biomass Producers Cluster',
    facilityName: 'Ludhiana Biochar Industrial Sink Ltd.',
    issuanceDate: new Date().toISOString().split('T')[0],
    methodologyStandard: 'Verra VM0044 & IPCC Tier 2 Solid Waste Protocol',
  }

  // Digital Passport data object for Step 4
  const passportData: DigitalPassportData = {
    batchId: 'W2C-2026-000124',
    wasteType: selectedPreset.name,
    quantityTons: customQuantity,
    generatorName: selectedPreset.originName,
    generatorCert: 'AGR-PB-2024-8849-CERT',
    originLocation: `${selectedPreset.originName}, ${selectedPreset.region}`,
    originCoords: selectedPreset.originCoords,
    moistureAtDeparture: selectedPreset.moisture,
    departureTime: '2026-09-12 08:30 IST',
    vehicleId: 'PB-10-BX-9042 (BS-VI Clean Diesel Tipper)',
    driverName: 'Harpreet Singh',
    driverCredential: 'CRED-IN-LOG-89104',
    corridorRoute: 'GT Road NH-44 Industrial Freight Corridor',
    distanceKm: 42.4,
    vrpDieselReductionPct: 18,
    dieselConsumedLiters: fuelUsedLiters,
    facilityName: 'Ludhiana Biochar Industrial Sink Ltd.',
    facilityLocation: 'Industrial Focal Point Phase-VIII, Ludhiana, Punjab',
    kilnType: 'Continuous High-Temperature Slow Pyrolysis Retort Unit #3',
    kilnTempC: 650,
    conversionYieldPct: 32.0,
    biocharYieldTons: Number((customQuantity * 0.32).toFixed(1)),
    syngasRecoveryKWh: 4200,
    fixedCarbonPct: 78.4,
    hToCRatio: 0.38,
    permanenceYears: 100,
    avoidedLandfillCO2e: carbonMetrics.landfillBaselineAvoidedTCO2e,
    durableStorageCO2e: carbonMetrics.carbonStoredDurableTCO2e,
    transportDeductionCO2e: carbonMetrics.transportEmissionsTCO2e,
    processDeductionCO2e: carbonMetrics.processingEmissionsTCO2e,
    netCO2eBenefit: carbonMetrics.netCO2eBenefit,
    carbonCreditsMinted: carbonMetrics.carbonCreditsIssued,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestampSealed: '2026-09-12T14:45:00.000Z',
    verraStandard: 'Verra VM0044 Biochar & IPCC Tier 2 Solid Waste Protocol',
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-white flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar: Hackathon Live Pitch Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold font-heading tracking-tight text-white flex items-center gap-1.5">
                  Waste2Carbon Live Judge Pitch Simulation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  Interactive Demo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Witness the full 5-Engine Value Chain in 60 seconds: Feedstock &rarr; AI Pathway &rarr; Route &rarr; Carbon Ledger.
              </p>
            </div>
          </div>

          {/* Mode Controls: Auto-Play vs Manual + Close */}
          <div className="flex items-center gap-2">
            {/* Auto-Play Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAutoPlay
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Automatically advance through demo steps"
            >
              {isAutoPlay ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-amber-400" />
                  <span>Pause Auto-Play ({autoPlayTimer}s)</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Start Auto-Play</span>
                </>
              )}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1)
                setTransitProgress(0)
                setIsTruckMoving(true)
                toast.success('Simulation reset to Step 1')
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer"
              title="Reset to Step 1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Pitch Demo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 4-Step Progress Navigation Stepper */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 sm:px-6 py-3">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { num: 1, title: '1. Waste Source', sub: 'Input Biomass' },
              { num: 2, title: '2. AI Pathway', sub: '94% Biochar Match' },
              { num: 3, title: '3. GIS Logistics', sub: 'Animated 42 km Route' },
              { num: 4, title: '4. Carbon Ledger', sub: '+82.4 tCO₂e & Passport' },
            ].map((s) => {
              const isDone = currentStep > s.num
              const isCurrent = currentStep === s.num
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30 shadow-xs'
                      : isDone
                      ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span
                        className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {s.num}
                      </span>
                    )}
                    <span className="font-bold font-heading truncate">{s.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pl-5 truncate hidden sm:block">{s.sub}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* STEP 1: FEEDSTOCK INPUT                                                   */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Context Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-start gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Leaf className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-white font-heading">
                    Step 1: Give Me a Waste Source
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Judges frequently ask: <em className="text-emerald-300 font-semibold">“Show me how it works when a farm logs 100 tons of crop stubble.”</em> Choose an authentic regional organic waste stream below to trigger the 5-Engine pipeline.
                  </p>
                </div>
              </div>

              {/* Feedstock Presets */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Real-World Regional Biomass Stream
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FEEDSTOCK_PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset)
                          setCustomQuantity(preset.quantity)
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400/60 ring-2 ring-emerald-500/30 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                            Selected
                          </span>
                        )}
                        <div className="font-extrabold text-xs sm:text-sm font-heading">{preset.name}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{preset.region}</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-700/50 text-[10px] font-mono text-slate-300">
                          <span>📦 {preset.quantity} Metric Tonnes</span>
                          <span>💧 {preset.moisture}% Moisture</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Interactive Quantity Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Feedstock Tonnage to Process:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">
                    {customQuantity} Metric Tonnes
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>10 Tonnes (Micro Farm)</span>
                  <span>250 Tonnes (Sugar Mill)</span>
                  <span>500 Tonnes (Industrial Agro)</span>
                </div>
              </div>

              {/* Problem Baseline Warning Card */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-start gap-3">
                <span className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wide">
                    The Problem: Conventional Baseline Impact
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Without Waste2Carbon, this {customQuantity}t of {selectedPreset.name} is dumped in open landfills or burned in fields, generating approximately{' '}
                    <strong className="text-red-400 font-mono">
                      +{(customQuantity * 0.98).toFixed(1)} tCO₂e
                    </strong>{' '}
                    of runaway fugitive methane and hazardous particulate matter ($PM_{2.5}$).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: AI PATHWAY RECOMMENDATION & SMART MATCH                            */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Step 2: AI Waste Pathway Recommendation &amp; Multi-Criteria Match
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      “Our platform doesn’t just find where waste can go. It determines the most valuable, carbon-permanent, and profitable pathway for that waste.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Algorithmic AI Pathway Recommendations */}
              <AIPathwayCard
                input={{
                  wasteType: selectedPreset.type,
                  quantityTons: customQuantity,
                  moisturePercent: selectedPreset.moisture,
                  distanceKm: 42.4,
                }}
                selectedPathway={selectedPathway}
                onSelectPathway={(p) => {
                  setSelectedPathway(p)
                  toast.success(`Selected ${p.toUpperCase()} as active simulation pathway`)
                }}
                showTitle={false}
              />

              {/* 5-Factor Score Radar Bar Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">
                    5-Factor Algorithmic Score Breakdown for #1 Facility:
                  </span>
                  <span className="font-extrabold text-emerald-400 font-mono">94 / 100 Overall</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Compatibility (35%)</span>
                    <strong className="text-emerald-400">98 / 100</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Proximity (25%)</span>
                    <strong className="text-blue-400">88 / 100</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Economics (15%)</span>
                    <strong className="text-indigo-400">92 / 100</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Capacity (15%)</span>
                    <strong className="text-amber-400">95 / 100</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Carbon Yield (10%)</span>
                    <strong className="text-teal-400">96 / 100</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ANIMATED GIS ROUTE OPTIMIZATION                                   */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Step 3: GIS Route Optimization &amp; Live Telemetry Transit
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Watch the dynamic vehicle routing solver dispatch and track biomass haul in real time across the 42.4 km corridor.
                    </p>
                  </div>
                </div>

                {/* Mode Switcher & Controls */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMapViewMode('leaflet')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        mapViewMode === 'leaflet'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>GIS Interactive Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapViewMode('hud')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        mapViewMode === 'hud'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Gauge className="h-3.5 w-3.5" />
                      <span>Telemetry Vector HUD</span>
                    </button>
                  </div>

                  {mapViewMode === 'hud' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTruckMoving(!isTruckMoving)}
                        className="p-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        {isTruckMoving ? <Pause className="h-3 w-3 text-amber-400" /> : <Play className="h-3 w-3 text-emerald-400" />}
                        <span>{isTruckMoving ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransitSpeed(transitSpeed === 1 ? 2 : transitSpeed === 2 ? 4 : 1)}
                        className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-emerald-400 border border-slate-700 cursor-pointer"
                        title="Change Playback Speed"
                      >
                        {transitSpeed}x Speed
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View 1: GIS Leaflet Map with Real-Time Vehicle Interpolation */}
              {mapViewMode === 'leaflet' ? (
                <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in duration-200">
                  <AnimatedRouteMap
                    origin={{
                      name: selectedPreset.originName,
                      lat: selectedPreset.originCoords[0],
                      lng: selectedPreset.originCoords[1],
                      type: 'Agricultural Farm Gate',
                    }}
                    destination={{
                      name: 'Ludhiana Biochar Industrial Sink Ltd.',
                      lat: 30.9010,
                      lng: 75.8573,
                      type: 'Biochar Pyrolysis Offtake Plant',
                    }}
                    waypoints={ROUTE_WAYPOINTS}
                    totalDistanceKm={42.4}
                    distanceSavedPct={18}
                    vehicleName="EV / Biodiesel Tipper #PB-10-BX-9042"
                    driverName="Manpreet Singh (Logistics Lead)"
                    height="440px"
                    autoPlay={true}
                    showControls={true}
                    showTelemetryHUD={true}
                  />
                </div>
              ) : (
                /* View 2: Vector Corridor HUD Visualizer */
                <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden p-6 space-y-6">
                  {/* Background Map Grid Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Origin / Destination Visual Path */}
                <div className="relative z-10 space-y-4">
                  {/* Origin & Destination Cards */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Origin */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80">
                      <span className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                        📍 Farm
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Origin Source</span>
                        <h4 className="text-xs font-extrabold text-white font-heading">{selectedPreset.originName}</h4>
                        <span className="text-[10px] font-mono text-emerald-400">30.7046° N, 76.2219° E</span>
                      </div>
                    </div>

                    {/* Mid Corridor Status */}
                    <div className="text-center px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-400/30">
                      <span className="text-[10px] font-bold text-blue-300 uppercase block tracking-wider">
                        VRP Optimized Corridor
                      </span>
                      <span className="text-xs font-extrabold text-white font-mono">
                        42.4 km &bull; GT Road NH-44
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-400 block mt-0.5">
                        &darr; 18% Distance Saved vs Direct Haul
                      </span>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80">
                      <span className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
                        🏭 Plant
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Offtake Destination</span>
                        <h4 className="text-xs font-extrabold text-white font-heading">Ludhiana Biochar Carbon Sink</h4>
                        <span className="text-[10px] font-mono text-teal-400">30.9010° N, 75.8573° E</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Polyline Track with Moving Truck */}
                  <div className="py-4 space-y-2">
                    <div className="relative h-4 bg-slate-800 rounded-full overflow-visible">
                      {/* Completed track */}
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full transition-all duration-75 shadow-lg shadow-emerald-500/30"
                        style={{ width: `${transitProgress}%` }}
                      />

                      {/* Moving Truck Pin */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-75"
                        style={{ left: `${transitProgress}%` }}
                      >
                        <div className="p-2 rounded-full bg-emerald-400 text-slate-950 shadow-xl ring-4 ring-emerald-500/40 animate-pulse">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-emerald-300 mt-1 whitespace-nowrap shadow-md">
                          🚛 {currentKm} km
                        </div>
                      </div>
                    </div>

                    {/* Waypoint Markers below track */}
                    <div className="flex justify-between text-[10px] text-slate-400 pt-3">
                      {ROUTE_WAYPOINTS.map((wp, idx) => {
                        const isReached = currentKm >= wp.distanceKm
                        return (
                          <div key={idx} className="flex flex-col items-center text-center max-w-[80px]">
                            <div
                              className={`h-2 w-2 rounded-full mb-1 ${
                                isReached ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-700'
                              }`}
                            />
                            <span className={isReached ? 'text-white font-semibold' : 'text-slate-500'}>
                              {wp.distanceKm} km
                            </span>
                            <span className="text-[9px] text-slate-500 truncate w-full">{wp.name.split(' ')[0]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Real-Time Telemetry HUD Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance Traveled</span>
                    <strong className="text-lg font-extrabold text-emerald-400 font-mono">
                      {currentKm} / 42.4 km
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Speed: ~58 km/h</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Route Fuel Used</span>
                    <strong className="text-lg font-extrabold text-amber-400 font-mono">
                      {fuelUsedLiters} L Diesel
                    </strong>
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      Saved -{fuelSavedLiters} L via VRP
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Emissions</span>
                    <strong className="text-lg font-extrabold text-red-400 font-mono">
                      -0.7 tCO₂e
                    </strong>
                    <span className="text-[10px] text-slate-500 block">0.000162 t/t-km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Intake Status</span>
                    <strong className="text-xs font-extrabold text-white flex items-center gap-1 mt-1">
                      {transitProgress >= 100 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400">At Pyrolysis Kiln</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                          <span>{currentWaypoint.status}</span>
                        </>
                      )}
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">{currentWaypoint.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          {/* ========================================================================= */}
          {/* STEP 4: CARBON LEDGER & DIGITAL PASSPORT                                   */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Award className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Step 4: Verified Carbon Ledger &amp; Waste-to-Carbon Digital Passport
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      “Every movement is tracked from source &rarr; transport &rarr; conversion &rarr; certified carbon impact.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Top 2 Columns: 5-Step Carbon Ledger & Digital Passport Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: 5-Step Transparent Carbon Ledger (6 Cols) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          5-Step Algorithmic Impact Ledger
                        </span>
                        <h4 className="text-xs font-extrabold text-white font-heading">
                          Net Verified Benefit (§6, §24)
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                        +{carbonMetrics.netCO2eBenefit} tCO₂e Net
                      </span>
                    </div>

                    {/* Step Breakdown Cards */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-300">1. Avoided Landfill Methane Decay</span>
                        <strong className="text-emerald-400 font-mono">
                          +{carbonMetrics.landfillBaselineAvoidedTCO2e} tCO₂e
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-300">2. Durable Carbon Storage (44/12 Stoichiometry)</span>
                        <strong className="text-teal-400 font-mono">
                          +{carbonMetrics.carbonStoredDurableTCO2e} tCO₂e
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-300">3. Logistics Transit Deduction (42.4 km)</span>
                        <strong className="text-amber-400 font-mono">
                          -{carbonMetrics.transportEmissionsTCO2e} tCO₂e
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-300">4. Facility Processing Energy Deduction</span>
                        <strong className="text-red-400 font-mono">
                          -{carbonMetrics.processingEmissionsTCO2e} tCO₂e
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-mono">
                        <span className="font-bold text-emerald-300 text-xs">Verified Net Carbon Credits:</span>
                        <span className="text-base font-extrabold text-white">
                          {carbonMetrics.carbonCreditsIssued} Credits (tCO₂e)
                        </span>
                      </div>
                    </div>

                    {/* Equivalence Counters */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Tree Equivalent</span>
                          <strong className="text-white text-xs">~{carbonMetrics.equivalentTreesPlanted} trees/yr</strong>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 flex items-center gap-2">
                        <Car className="h-4 w-4 text-teal-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Vehicle Days</span>
                          <strong className="text-white text-xs">~{carbonMetrics.carsRemovedOffRoadDays} car-days</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Digital Passport Artifact (6 Cols) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Waste-to-Carbon Digital Passport</span>
                        </div>
                        <h4 className="text-xs text-slate-400 font-mono mt-0.5">
                          BATCH MANIFEST: <span className="text-white font-bold">W2C-2026-000124</span>
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-extrabold">
                        SEALED
                      </span>
                    </div>

                    {/* SVG QR Code & Batch Metadata */}
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                        <QRCodeGenerator
                          value="https://waste2carbon.eco/track/W2C-2026-000124"
                          size={88}
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Tamper-Proof Audit Hash
                        </span>
                        <code className="text-[9px] font-mono text-emerald-300 block bg-black/40 p-1 rounded break-all">
                          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </code>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-300">
                          <span>Verified: Punjab PCB</span>
                          <span>&bull;</span>
                          <span>Methodology: VM0044</span>
                        </div>
                      </div>
                    </div>

                    {/* Chain of Custody Summary */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Certified Origin:</span>
                        <span className="font-semibold text-white">{selectedPreset.originName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Assigned Logistics:</span>
                        <span className="font-semibold text-white">Eicher Pro 3019 (Harpreet S.)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Conversion Kiln:</span>
                        <span className="font-semibold text-teal-300">Ludhiana Pyrolysis Reactor #2</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">End Carbon Product:</span>
                        <span className="font-semibold text-emerald-300">32.0t Biochar Agronomic Soil Sink</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPassportModal(true)}
                        className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border border-emerald-500/40 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Digital Passport</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCertModal(true)}
                        className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Certificate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('https://waste2carbon.eco/track/W2C-2026-000124')
                          toast.success('Public Tracking Link copied: /track/W2C-2026-000124')
                        }}
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                        title="Copy Public Verifier Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Share QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Step {currentStep} of 4</span>
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Next: {currentStep === 1 ? 'AI Pathway' : currentStep === 2 ? 'GIS Logistics' : 'Carbon Ledger'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Conclude Judge Pitch</span>
            </button>
          )}
        </div>
      </div>

      {/* Verified Certificate Modal sub-overlay */}
      {showCertModal && (
        <CarbonCertificateModal
          data={certificateData}
          onClose={() => setShowCertModal(false)}
        />
      )}

      {/* Digital Passport Modal sub-overlay */}
      {showPassportModal && (
        <DigitalPassportModal
          passport={passportData}
          onClose={() => setShowPassportModal(false)}
          onOpenCertificate={() => {
            setShowPassportModal(false)
            setShowCertModal(true)
          }}
        />
      )}
    </div>,
    document.body
  )
}

export default JudgeDemoModal
