import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  Percent,
  Weight,
  Crosshair,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import { wasteListingService } from '../../services/wasteListing.service'
import toast from 'react-hot-toast'

import { geocodeAddress } from '../../utils/geocoding'

// Zod schema for Waste Listing
const listingSchema = z
  .object({
    wasteType: z.enum(['agricultural', 'food', 'manure', 'industrial_organic'] as const, {
      message: 'Please select a valid waste category',
    }),
    quantityTons: z.coerce
      .number({ message: 'Quantity is required' })
      .positive('Quantity must be greater than 0')
      .max(1000, 'Maximum per batch is 1000 tons'),
    moistureContent: z.coerce
      .number({ message: 'Moisture is required' })
      .min(0, 'Moisture percentage cannot be negative')
      .max(100, 'Moisture percentage cannot exceed 100%'),
    availableFrom: z.string().min(1, 'Availability start date is required'),
    availableTo: z.string().min(1, 'Availability end date is required'),
    locationLat: z.coerce.number().min(-90).max(90),
    locationLng: z.coerce.number().min(-180).max(180),
    address: z.string().min(3, 'Pickup address or landmark is required'),
  })
  .refine((data) => new Date(data.availableTo) >= new Date(data.availableFrom), {
    message: 'End date must be on or after start date',
    path: ['availableTo'],
  })

type ListingFormValues = z.infer<typeof listingSchema>

// Pin Drop Marker for Generator's Waste Location
const createGeneratorDropPin = () => {
  return L.divIcon({
    className: 'custom-generator-drop-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></div>
        <div class="h-9 w-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

// Leaflet map event listener for click-to-pin
const MapPickerEvents: React.FC<{ onLocationPicked: (lat: number, lng: number) => void }> = ({
  onLocationPicked,
}) => {
  useMapEvents({
    click(e) {
      onLocationPicked(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)))
    },
  })
  return null
}

// Recenter Leaflet Map
const MapFlyTo: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    map.flyTo(coords, Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [coords, map])
  return null
}

export const PostListingPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Default coordinate values pre-filled from user's registered profile
  const defaultLat = user?.location_lat || 12.9352
  const defaultLng = user?.location_lng || 77.6245

  const todayStr = new Date().toISOString().split('T')[0]
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      wasteType: 'agricultural',
      quantityTons: 12.5,
      moistureContent: 22,
      availableFrom: todayStr,
      availableTo: nextWeekStr,
      locationLat: defaultLat,
      locationLng: defaultLng,
      address: `${user?.city || 'Bengaluru'} Ag Farmgate, Gate #2`,
    },
  })

  const watchedLat = watch('locationLat')
  const watchedLng = watch('locationLng')
  const watchedAddress = watch('address')
  const watchedWasteType = watch('wasteType')
  const watchedQuantity = watch('quantityTons') || 0
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Auto-geocode whenever user modifies the address input field
  useEffect(() => {
    if (!watchedAddress || watchedAddress.trim().length < 2) return

    const timer = setTimeout(async () => {
      setIsGeocoding(true)
      const res = await geocodeAddress(watchedAddress)
      setIsGeocoding(false)
      if (res) {
        setValue('locationLat', Number(res.lat.toFixed(5)))
        setValue('locationLng', Number(res.lng.toFixed(5)))
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [watchedAddress, setValue])

  // React Query Mutation with instant toast feedback & cache invalidation
  const createListingMutation = useMutation({
    mutationFn: async (payload: ListingFormValues) => {
      const fromDate = new Date(payload.availableFrom).toISOString()
      const toDate = new Date(payload.availableTo).toISOString()
      return await wasteListingService.createListing({
        wasteType: payload.wasteType,
        quantityTons: Number(payload.quantityTons),
        moistureContent: payload.moistureContent ? Number(payload.moistureContent) : undefined,
        availableFrom: fromDate,
        availableTo: toDate,
        locationLat: Number(payload.locationLat),
        locationLng: Number(payload.locationLng),
        address: payload.address,
      })
    },
    onSuccess: () => {
      // Invalidate queries so dashboards & listings update immediately
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['generatorSummary'] })
      toast.success('Waste listing published! Offtake matching algorithm alerted.')
      navigate('/generator/listings')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to post listing. Please try again.')
    },
  })

  // Handle GPS location click
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    toast.loading('Locating GPS coordinates...', { id: 'post-gps' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5))
        const lng = Number(pos.coords.longitude.toFixed(5))
        setValue('locationLat', lat)
        setValue('locationLng', lng)
        toast.success(`Coordinates pinned: ${lat}, ${lng}`, { id: 'post-gps' })
      },
      () => {
        toast.error('Unable to retrieve GPS. Click on the map to pin your location.', { id: 'post-gps' })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const onSubmit = (data: ListingFormValues) => {
    createListingMutation.mutate(data)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/generator/dashboard"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
            Post New Waste Listing
          </h1>
          <p className="text-xs text-slate-500">
            Provide organic batch specs for automated proximity matching with bio-plants
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200/90 shadow-sm bg-white/90">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* 1. Waste Category Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Waste Category <span className="text-red-500">*</span>
            </label>
            <Controller
              name="wasteType"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { id: 'agricultural', label: 'Agricultural', desc: 'Crop stubble, husks' },
                      { id: 'food', label: 'Food Waste', desc: 'Commercial/kitchen pulp' },
                      { id: 'manure', label: 'Livestock Manure', desc: 'Dairy, poultry bedding' },
                      { id: 'industrial_organic', label: 'Industrial Organics', desc: 'Brewery, distillery mash' },
                    ] as const
                  ).map((item) => {
                    const isSelected = field.value === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => field.onChange(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize">{item.label}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.wasteType && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.wasteType.message}
              </p>
            )}
          </div>

          {/* 2. Quantity & Moisture Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity (Tons) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Quantity (Metric Tons) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register('quantityTons', { valueAsNumber: true })}
                  placeholder="e.g. 15.0"
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-all text-slate-800 ${
                    errors.quantityTons
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.quantityTons ? (
                <p className="text-xs text-red-600 font-medium">{errors.quantityTons.message}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Total batch tonnage ready for dispatch</p>
              )}
            </div>

            {/* Moisture Content (%) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Moisture Content (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  {...register('moistureContent', { valueAsNumber: true })}
                  placeholder="e.g. 25"
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-all text-slate-800 ${
                    errors.moistureContent
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.moistureContent ? (
                <p className="text-xs text-red-600 font-medium">{errors.moistureContent.message}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Determines digester vs pyrolysis suitability</p>
              )}
            </div>
          </div>

          {/* 3. Availability Date Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Available From */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Available From Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  {...register('availableFrom')}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-all text-slate-800 ${
                    errors.availableFrom
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.availableFrom && (
                <p className="text-xs text-red-600 font-medium">{errors.availableFrom.message}</p>
              )}
            </div>

            {/* Available To */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Available To Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  {...register('availableTo')}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-all text-slate-800 ${
                    errors.availableTo
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.availableTo && (
                <p className="text-xs text-red-600 font-medium">{errors.availableTo.message}</p>
              )}
            </div>
          </div>

          {/* 4. Pin Drop Location Picker (Pre-filled from profile coordinates) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Farmgate / Pickup Location Pin <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
                <span>Snap to My Current GPS</span>
              </button>
            </div>

            {/* Address input */}
            <div className="space-y-1">
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  {...register('address')}
                  placeholder="e.g. Ahmedabad, Gujarat or Koramangala, Bengaluru"
                  className={`w-full pl-9 pr-24 py-2 text-sm bg-white border rounded-xl focus:outline-none transition-all text-slate-800 ${
                    errors.address
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {isGeocoding ? (
                  <span className="absolute right-3 top-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Locating...
                  </span>
                ) : (
                  <span className="absolute right-3 top-2 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md pointer-events-none">
                    Map Synced
                  </span>
                )}
              </div>
              {errors.address && (
                <p className="text-xs text-red-600 font-medium">{errors.address.message}</p>
              )}
            </div>

            {/* Interactive Leaflet Pin Drop Container */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Tap map anywhere to drop pickup pin:
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                  {watchedLat.toFixed(4)}, {watchedLng.toFixed(4)}
                </span>
              </div>

              <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0">
                <MapContainer
                  center={[watchedLat, watchedLng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  <MapPickerEvents
                    onLocationPicked={(lat, lng) => {
                      setValue('locationLat', lat)
                      setValue('locationLng', lng)
                    }}
                  />
                  <MapFlyTo coords={[watchedLat, watchedLng]} />
                  <Marker
                    position={[watchedLat, watchedLng]}
                    icon={createGeneratorDropPin()}
                  />
                </MapContainer>

                <div className="absolute bottom-2 left-2 z-[500] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-sm pointer-events-none">
                  📍 Click map to update pickup coordinates
                </div>
              </div>
            </div>
          </div>

          {/* Impact Estimation Callout */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Estimated Carbon Sequestration Value</p>
              <p className="text-emerald-700 mt-0.5">
                Posting {watchedQuantity || 0} tons of {watchedWasteType.replace('_', ' ')} diverts an estimated{' '}
                <strong className="font-bold text-emerald-900">
                  {((watchedQuantity || 0) * 1.48).toFixed(1)} tCO2e
                </strong>{' '}
                from landfill methane emission, yielding approx.{' '}
                <strong className="font-bold text-emerald-900">
                  {Math.round((watchedQuantity || 0) * 1.48)} carbon offset credits
                </strong>.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createListingMutation.isPending}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {createListingMutation.isPending ? (
              'Publishing & Alerting Facilities...'
            ) : (
              <>
                <Leaf className="h-4 w-4" />
                <span>Publish Waste Listing &amp; Run Matchmaker</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostListingPage
