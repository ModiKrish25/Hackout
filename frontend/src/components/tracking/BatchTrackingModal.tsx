import React from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Clock,
  Truck,
  MapPin,
  Calendar,
  Building2,
  FileCheck2,
  Sparkles,
  Award,
  ShieldCheck,
  Scale,
  Flame,
} from 'lucide-react'
import { QRCodeGenerator } from '../shared/QRCodeGenerator'
import { calculateCarbonImpact } from '../../utils/carbonEngine'

export interface BatchTrackingDetails {
  batchId: string
  listingId: number
  wasteType: string
  quantityTons: number
  generatorName: string
  facilityName: string
  facilityType: string
  originAddress: string
  destinationAddress: string
  driverName?: string
  truckNumber?: string
  distanceKm: number
  createdAt: string
  currentStageIndex: number // 0 to 9 (corresponds to LIFECYCLE_STAGES)
}

export const LIFECYCLE_STAGES = [
  { id: 'CREATED', label: 'Batch Created', desc: 'Listing logged with certified feedstock assay', icon: Scale },
  { id: 'MATCHED', label: 'Offtake Matched', desc: 'Optimal bio-conversion facility bound via AI', icon: Sparkles },
  { id: 'COLLECTION_SCHEDULED', label: 'Collection Scheduled', desc: 'Assigned to TSP logistics route dispatch', icon: Calendar },
  { id: 'PICKED_UP', label: 'Picked Up', desc: 'Weighbridge gate verification completed', icon: Truck },
  { id: 'IN_TRANSIT', label: 'In Transit', desc: 'Secure geo-tracked biomass transport', icon: MapPin },
  { id: 'RECEIVED', label: 'Plant Received', desc: 'Facility intake QA & moisture inspection passed', icon: Building2 },
  { id: 'PROCESSING', label: 'In Processing', desc: 'Anaerobic digestion / Pyrolysis hopper loaded', icon: Clock },
  { id: 'CONVERTED', label: 'Converted to Value', desc: 'Biochar / Biomethane output generated', icon: Flame },
  { id: 'CARBON_VERIFIED', label: 'Carbon Verified', desc: 'IPCC & Verra methodology equations audited', icon: FileCheck2 },
  { id: 'COMPLETED', label: 'Completed & Certified', desc: 'Official digital certificate minted to ledger', icon: Award },
]

interface BatchTrackingModalProps {
  batch: BatchTrackingDetails
  onClose: () => void
  onOpenCertificate?: () => void
}

export const BatchTrackingModal: React.FC<BatchTrackingModalProps> = ({
  batch,
  onClose,
  onOpenCertificate,
}) => {
  const carbon = calculateCarbonImpact({
    wasteType: batch.wasteType,
    quantityTons: batch.quantityTons,
    distanceKm: batch.distanceKm,
    pathway: batch.facilityType.toLowerCase().includes('biochar') ? 'biochar' : 'biogas',
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 shadow-md">
                {batch.batchId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 border border-white/15">
                Waste-to-Carbon Value Chain Tracker
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-white pt-1">
              End-to-End Batch Manifest &amp; QR Audit
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Immutable physical journey from farmgate generation through logistics dispatch, facility conversion, and verified carbon crediting.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Top Quick Summary & QR Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Origin & Destination & Logistics info */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Waste Generator
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{batch.generatorName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{batch.originAddress}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <Scale className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{batch.quantityTons} Tons {batch.wasteType.toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Destination Plant
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{batch.facilityName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{batch.destinationAddress}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{batch.facilityType}</span>
                  </div>
                </div>
              </div>

              {/* Transit Details Strip */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">
                    Carrier Vehicle: <strong className="text-slate-900">{batch.truckNumber || 'KA-04-EV-9821'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    Transit Distance: <strong className="text-slate-900">{batch.distanceKm} km</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>PCB Compliance Valid</span>
                </div>
              </div>

              {/* 5-Step Carbon Summary Pill Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Calculated Carbon Value
                  </span>
                  <span className="text-xs font-mono text-slate-400">IPCC Tier 2 Audited</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-[10px] text-slate-300 block">Avoided Landfill</span>
                    <span className="text-sm font-bold text-emerald-300 font-heading">
                      +{carbon.landfillBaselineAvoidedTCO2e} t
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-[10px] text-slate-300 block">Carbon Stored</span>
                    <span className="text-sm font-bold text-teal-300 font-heading">
                      +{carbon.carbonStoredDurableTCO2e} t
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-200 block">Net CO₂e Saved</span>
                    <span className="text-base font-extrabold text-emerald-400 font-heading">
                      {carbon.netCO2eBenefit} t
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: SVG QR Code Manifest Stamp */}
            <div className="flex flex-col items-center">
              <QRCodeGenerator
                value={batch.batchId}
                title="Batch QR Stamp"
                subtitle="Scan at weighbridge / gate"
                size={180}
              />
            </div>
          </div>

          {/* 10-Stage Lifecycle Stepper (§14) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <span>10-Stage Value Chain Lifecycle</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Step {batch.currentStageIndex + 1} of 10
                </span>
              </h3>
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                Real-Time Chain of Custody
              </span>
            </div>

            {/* Vertical / Horizontal Stepper */}
            <div className="relative border-l-2 sm:border-l-0 sm:grid sm:grid-cols-5 gap-3 pl-4 sm:pl-0 border-emerald-300 space-y-4 sm:space-y-0">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = idx <= batch.currentStageIndex
                const isCurrent = idx === batch.currentStageIndex
                const Icon = stage.icon

                return (
                  <div
                    key={stage.id}
                    className={`relative p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-300'
                        : isPassed
                        ? 'bg-emerald-50 text-slate-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`h-7 w-7 rounded-xl flex items-center justify-center ${
                          isCurrent
                            ? 'bg-white text-emerald-700'
                            : isPassed
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isCurrent ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-extrabold ${
                        isCurrent ? 'text-white' : isPassed ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {stage.label}
                    </h4>
                    <p
                      className={`text-[10px] mt-1 leading-snug line-clamp-2 ${
                        isCurrent ? 'text-emerald-100' : isPassed ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {stage.desc}
                    </p>

                    {isCurrent && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>Active Now</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Assay Hash: <code className="font-mono text-[11px] text-slate-700">sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f...</code>
            </div>

            <div className="flex items-center gap-3">
              {onOpenCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenCertificate()
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>View Verified Certificate</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
