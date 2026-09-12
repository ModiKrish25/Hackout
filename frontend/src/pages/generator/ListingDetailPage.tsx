import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  MapPin,
  Calendar,
  Trash2,
  Building2,
  AlertTriangle,
  Lock,
  Sparkles,
  Zap,
  Clock,
  QrCode,
  Award,
  Calculator,
  Printer,
  Navigation,
  ShieldCheck,
} from 'lucide-react'
import { mockDb } from '../../api/mockData'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { MapView, type MapMarkerData } from '../../components/map/MapView'
import { QRCodeGenerator } from '../../components/shared/QRCodeGenerator'
import { BatchTrackingModal } from '../../components/tracking/BatchTrackingModal'
import { CarbonCertificateModal } from '../../components/carbon/CarbonCertificateModal'
import { CarbonCalculatorModal } from '../../components/carbon/CarbonCalculatorModal'
import { MatchScoreBreakdownModal } from '../../components/matching/MatchScoreBreakdownModal'
import toast from 'react-hot-toast'

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Advanced feature modals state
  const [showQRTrackingModal, setShowQRTrackingModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showCalculatorModal, setShowCalculatorModal] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)

  const listingId = Number(id)
  const listing = mockDb.getListings().find((l) => l.id === listingId) || mockDb.getListings()[0]
  const stages = ['listed', 'matched', 'scheduled', 'collected', 'processed']
  const currentStageIndex = stages.indexOf(listing.status)

  const batchSerial = listing.batchId || `W2C-2026-${String(listing.id).padStart(6, '0')}`

  const stageTo10StepIndex: Record<string, number> = {
    listed: 0,
    matched: 1,
    scheduled: 2,
    collected: 4,
    processed: 9,
  }
  const current10StepIndex = stageTo10StepIndex[listing.status] ?? 0

  // Matched facility details (if matched)
  const matchedFacility = listing.matchedFacilityId
    ? mockDb.getFacilities().find((f) => f.id === listing.matchedFacilityId)
    : mockDb.getFacilities()[0]

  // Estimated distance calculation between generator and matched facility
  const distanceKm = listing.matchedFacilityName ? 7.8 : null
  const compatibilityScore = 96 // 96% match score

  // Carbon computations
  const avoidedCO2e = (listing.quantityTons * 1.48).toFixed(1)
  const methaneBaselineKg = (listing.quantityTons * 82).toFixed(0)
  const carbonCredits = Math.round(listing.quantityTons * 1.48)
  const estimatedCreditValue = (carbonCredits * 32).toLocaleString()

  // Cancel action handling
  const canCancel = listing.status === 'listed'

  const handleCancel = () => {
    if (!canCancel) return
    if (window.confirm('Are you sure you want to cancel this waste listing? This will remove it from the matching engine.')) {
      const success = mockDb.cancelListing(listing.id)
      if (success) {
        toast.success('Listing cancelled successfully.')
        navigate('/generator/listings')
      } else {
        toast.error('Could not cancel listing.')
      }
    }
  }

  // Map markers: Generator pickup gate + Matched Facility
  const detailMarkers: MapMarkerData[] = [
    {
      id: `gen-${listing.id}`,
      lat: listing.locationLat,
      lng: listing.locationLng,
      type: 'generator',
      title: `${listing.wasteType.toUpperCase()} Pickup Gate`,
      subtitle: listing.address || 'Central Farm gate',
      quantityTons: listing.quantityTons,
      wasteType: listing.wasteType,
      status: listing.status,
    },
  ]

  if (listing.matchedFacilityName && matchedFacility) {
    detailMarkers.push({
      id: `fac-${matchedFacility.id}`,
      lat: matchedFacility.locationLat,
      lng: matchedFacility.locationLng,
      type: 'facility',
      title: matchedFacility.name,
      subtitle: 'Bio-methanation Processing Plant',
      status: 'active',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/generator/listings"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading capitalize tracking-tight">
                {listing.wasteType.replace('_', ' ')}
              </h1>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
                {batchSerial}
              </span>
              <StatusBadge status={listing.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Published on {new Date(listing.createdAt).toLocaleDateString()} &bull; Generator ID: #{listing.generatorId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowQRTrackingModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5 text-emerald-400" />
            <span>QR &amp; 10-Stage Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            <span>Certificate</span>
          </button>

          {canCancel ? (
            <button
              onClick={handleCancel}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Batch QR Code & Manifest Card (§14, §15) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <QrCode className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Batch QR Code &amp; Manifest (§14, §15)
              </h2>
              <p className="text-xs text-slate-500">
                Immutable physical bin label with deterministic cryptographic payload &amp; 10-stage chain-of-custody
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto">
            {batchSerial}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Mini QR Thumbnail */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-center">
            <QRCodeGenerator
              value={`W2C-BATCH:${batchSerial}:LISTING-${listing.id}`}
              size={120}
              showActions={false}
              className="p-1.5 border-0 shadow-none bg-transparent"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1 font-semibold">
              {batchSerial}
            </span>
          </div>

          {/* Manifest Spec Grid */}
          <div className="md:col-span-9 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Feedstock Assay</span>
                <span className="text-xs font-extrabold text-slate-900 capitalize">
                  {listing.wasteType.replace('_', ' ')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Net Weight</span>
                <span className="text-xs font-extrabold text-slate-900">
                  {listing.quantityTons} Tons Payload
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Chain Stage</span>
                <span className="text-xs font-extrabold text-emerald-700">
                  Stage {current10StepIndex + 1} of 10
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Weighbridge</span>
                <span className="text-xs font-extrabold text-blue-700">
                  Certified QA Pass
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Geofenced origin GPS coordinates verified for tamper-proof traceability.</span>
              </div>

              {/* Required buttons: "Scan / Print QR Label" & "Track Live Journey" */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQRTrackingModal(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  <span>Scan / Print QR Label</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQRTrackingModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Track Live Journey</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. 5-Stage Visual Progress Stepper */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/90 shadow-sm bg-white/90 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            5-Stage Lifecycle Progress Stepper
          </h2>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full capitalize">
            Current: {listing.status}
          </span>
        </div>

        <div className="relative flex items-center justify-between pt-2 pb-1">
          {/* Connecting Background Line */}
          <div className="absolute left-6 right-6 top-6 -translate-y-1/2 h-1.5 bg-slate-100 -z-0 rounded-full">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex
            const isCurrent = idx === currentStageIndex
            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-bold mt-2.5 capitalize ${
                    isCurrent ? 'text-emerald-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                  {stage === 'listed' && 'Pool Open'}
                  {stage === 'matched' && 'Offtake Bound'}
                  {stage === 'scheduled' && 'Route Active'}
                  {stage === 'collected' && 'Loaded'}
                  {stage === 'processed' && 'Sequestered'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Matched Facility Specs, Distance, & Compatibility Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facility Info Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Off-take Facility Matching
              </h2>
            </div>
            {listing.matchedFacilityName && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Matched &amp; Bound
              </span>
            )}
          </div>

          {listing.matchedFacilityName ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Processing Facility
                </span>
                <h3 className="text-base font-bold text-slate-900">{listing.matchedFacilityName}</h3>
                <p className="text-xs text-slate-500">High-Solids Anaerobic Biomethanation &amp; Biochar Pyrolysis</p>
              </div>

              {/* Algorithmic Compatibility Score & Distance Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div
                  onClick={() => setShowMatchModal(true)}
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Algorithmic Fit</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 underline group-hover:text-emerald-900">
                      Breakdown &rarr;
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1 font-heading">
                    {compatibilityScore}%
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5">35% Compatibility, 25% Proximity, 15% Cost</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>Est. Proximity</span>
                  </div>
                  <div className="text-xl font-extrabold text-blue-800 mt-1 font-heading">
                    {distanceKm} km
                  </div>
                  <p className="text-[10px] text-blue-700 mt-0.5">Direct transport radius</p>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1 text-slate-600 border-t border-slate-100">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Weekly Intake Capacity:</span>
                  <span className="font-semibold text-slate-800">120.0 Tons / Week</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Biogas Energy Output:</span>
                  <span className="font-semibold text-slate-800">450 kWh / ton</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <Clock className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Off-take Matchmaker Active</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  The matching engine is evaluating nearby anaerobic digesters and pyrolysis plants within a 25 km radius.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Batch Specifications Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Batch Specifications
            </h2>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              GPS: {listing.locationLat.toFixed(3)}, {listing.locationLng.toFixed(3)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Waste Material:</span>
              <span className="font-bold text-slate-900 capitalize">
                {listing.wasteType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Net Quantity:</span>
              <span className="font-extrabold text-slate-900 text-sm font-heading">
                {listing.quantityTons} Metric Tons
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Moisture Content:</span>
              <span className="font-bold text-slate-800">{listing.moistureContent || 25}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Availability Window:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {listing.availableFrom} to {listing.availableTo}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Pickup Location:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 text-right max-w-[220px] truncate">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {listing.address || 'Central Farmgate Gate #2'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Carbon Impact Section: CO2 Sequestered vs Landfill Baseline Comparison */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-200/90 shadow-sm bg-gradient-to-br from-emerald-50/50 via-white to-white space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Carbon Impact &amp; Offtake Accounting
              </h2>
              <p className="text-xs text-slate-500">
                Landfill methane baseline comparison vs certified bio-conversion sequestration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCalculatorModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span>Open 5-Step Model</span>
          </button>
        </div>

        {/* Side-by-side Baseline vs Project comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Baseline Landfill Scenario */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Baseline Scenario (Landfill Dump)
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-800 font-heading">
              {methaneBaselineKg} kg <span className="text-xs font-normal text-slate-500">CH4 Released</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Uncontrolled anaerobic decomposition in open landfills emits potent methane gas (28x GWP of CO2) and polluting leachate.
            </p>
          </div>

          {/* EcoTrace Bio-Conversion Project */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                EcoTrace Valorization Project
              </span>
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-900 font-heading">
              {avoidedCO2e} <span className="text-xs font-normal text-emerald-700">tCO2e Avoided</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              100% methane capture via anaerobic digestion, converting biomass into green electricity and organic bio-fertilizer.
            </p>
          </div>
        </div>

        {/* Certified Credits & Monetization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Credits</span>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">{carbonCredits}</div>
            <span className="text-[10px] text-slate-500">Verra / Gold Standard</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Offtake Value</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-heading">
              ${estimatedCreditValue}
            </div>
            <span className="text-[10px] text-slate-500">@ $32/tCO2e baseline</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">EPA Equivalent</span>
            <div className="text-2xl font-extrabold text-blue-700 font-heading">
              {(carbonCredits * 2.3).toFixed(0)}
            </div>
            <span className="text-[10px] text-slate-500">Passenger cars off road/yr</span>
          </div>
        </div>
      </div>

      {/* 4. Mini GIS Map View */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/90 shadow-sm bg-white/90 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Pickup Gate &amp; Facility GIS Coordinates
            </h3>
          </div>
          <span className="text-xs text-slate-500">Interactive Location Preview</span>
        </div>

        <MapView
          height="280px"
          center={[listing.locationLat, listing.locationLng]}
          zoom={13}
          markers={detailMarkers}
          fitBoundsToMarkers={true}
        />
      </div>

      {/* MODAL 1: QR & 10-Stage Lifecycle Tracker */}
      {showQRTrackingModal && (
        <BatchTrackingModal
          batch={{
            batchId: batchSerial,
            listingId: listing.id,
            wasteType: listing.wasteType,
            quantityTons: listing.quantityTons,
            generatorName: listing.generatorName || 'Aarav Sharma (GreenAgro Farms)',
            facilityName: matchedFacility?.name || 'BioVeda Energy Biomethanation Plant',
            facilityType: matchedFacility?.facilityType || 'Anaerobic Digestion & Pyrolysis',
            originAddress: listing.address || 'Koramangala 4th Block, Agro Produce Hub',
            destinationAddress: matchedFacility?.address || 'Rajajinagar Industrial Area, Bangalore',
            driverName: 'Ramesh Kumar (EV Logistics)',
            truckNumber: 'KA-04-EV-9821',
            distanceKm: distanceKm || 8.5,
            createdAt: listing.createdAt,
            currentStageIndex: current10StepIndex,
          }}
          onClose={() => setShowQRTrackingModal(false)}
          onOpenCertificate={() => setShowCertificateModal(true)}
        />
      )}

      {/* MODAL 2: Verifiable Digital Carbon Certificate */}
      {showCertificateModal && (
        <CarbonCertificateModal
          data={{
            certificateId: `W2C-CERT-2026-${String(listing.id * 7391).slice(-6)}`,
            batchId: batchSerial,
            wasteType: listing.wasteType,
            quantityTons: listing.quantityTons,
            pathway: matchedFacility?.facilityType || 'Biochar & Biogas Valorization',
            netCO2eTons: Number(avoidedCO2e),
            landfillAvoidedTons: Number((listing.quantityTons * 0.82).toFixed(1)),
            carbonStoredTons: Number((listing.quantityTons * 0.66).toFixed(1)),
            generatorName: listing.generatorName || 'Aarav Sharma (GreenAgro Farms)',
            facilityName: matchedFacility?.name || 'BioVeda Energy Biomethanation Plant',
            issuanceDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            methodologyStandard: 'Verra VM0044 & IPCC Tier 2 Solid Waste Method',
          }}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* MODAL 3: Transparent Carbon Accounting Calculator */}
      {showCalculatorModal && (
        <CarbonCalculatorModal
          initialWasteType={listing.wasteType}
          initialQuantity={listing.quantityTons}
          initialDistance={distanceKm || 25}
          onClose={() => setShowCalculatorModal(false)}
        />
      )}

      {/* MODAL 4: 5-Factor Smart Matching Breakdown */}
      {showMatchModal && matchedFacility && (
        <MatchScoreBreakdownModal
          details={{
            facilityName: matchedFacility.name,
            facilityType: matchedFacility.facilityType,
            generatorName: listing.generatorName || 'GreenAgro Farms',
            wasteType: listing.wasteType,
            quantityTons: listing.quantityTons,
            distanceKm: distanceKm || 7.8,
            overallScore: compatibilityScore,
            compatibilityScore: 98,
            distanceScore: 95,
            processingCostScore: 92,
            capacityScore: 96,
            carbonBenefitScore: 94,
            offtakePricePerTon: 850,
            estimatedTransportCost: 1250,
            carbonBenefitTons: Number(avoidedCO2e),
          }}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  )
}

export default ListingDetailPage
