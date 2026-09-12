import React from 'react'
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
} from 'lucide-react'
import { mockDb } from '../../api/mockData'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { MapView, type MapMarkerData } from '../../components/map/MapView'
import toast from 'react-hot-toast'

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const listingId = Number(id)
  const listing = mockDb.getListings().find((l) => l.id === listingId) || mockDb.getListings()[0]
  const stages = ['listed', 'matched', 'scheduled', 'collected', 'processed']
  const currentStageIndex = stages.indexOf(listing.status)

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
                {listing.wasteType.replace('_', ' ')} Batch #{listing.id}
              </h1>
              <StatusBadge status={listing.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Published on {new Date(listing.createdAt).toLocaleDateString()} &bull; Generator ID: #{listing.generatorId}
            </p>
          </div>
        </div>

        {/* Cancel Listing Action */}
        <div>
          {canCancel ? (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Cancel Listing</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Locked (Matched to Offtake)</span>
            </div>
          )}
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
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Algorithmic Fit</span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1 font-heading">
                    {compatibilityScore}%
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5">High purity &amp; feedstock match</p>
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
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
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
    </div>
  )
}

export default ListingDetailPage
