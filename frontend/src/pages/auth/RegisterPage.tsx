import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Crosshair,
  CheckCircle2,
  Factory,
  Landmark,
  Sprout,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/auth.service'
import toast from 'react-hot-toast'
import type { UserRole } from '../../types'

// State-to-Coordinates mapping for automatic GIS localization
const STATE_COORDINATES: Record<string, { lat: number; lng: number; defaultCity: string }> = {
  Karnataka: { lat: 12.9716, lng: 77.5946, defaultCity: 'Bengaluru' },
  Maharashtra: { lat: 19.076, lng: 72.8777, defaultCity: 'Mumbai' },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707, defaultCity: 'Chennai' },
  Delhi: { lat: 28.6139, lng: 77.209, defaultCity: 'New Delhi' },
  Gujarat: { lat: 23.0225, lng: 72.5714, defaultCity: 'Ahmedabad' },
  Telangana: { lat: 17.385, lng: 78.4867, defaultCity: 'Hyderabad' },
  'Andhra Pradesh': { lat: 17.6868, lng: 83.2185, defaultCity: 'Visakhapatnam' },
  Punjab: { lat: 30.7333, lng: 76.7794, defaultCity: 'Chandigarh' },
  Haryana: { lat: 28.4595, lng: 77.0266, defaultCity: 'Gurugram' },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, defaultCity: 'Lucknow' },
  Rajasthan: { lat: 26.9124, lng: 75.7873, defaultCity: 'Jaipur' },
  'Madhya Pradesh': { lat: 23.2599, lng: 77.4126, defaultCity: 'Bhopal' },
  Kerala: { lat: 8.5241, lng: 76.9366, defaultCity: 'Thiruvananthapuram' },
  'West Bengal': { lat: 22.5726, lng: 88.3639, defaultCity: 'Kolkata' },
  Bihar: { lat: 25.5941, lng: 85.1376, defaultCity: 'Patna' },
  Odisha: { lat: 20.2961, lng: 85.8245, defaultCity: 'Bhubaneswar' },
  Goa: { lat: 15.4909, lng: 73.8278, defaultCity: 'Panaji' },
  Uttarakhand: { lat: 30.3165, lng: 78.0322, defaultCity: 'Dehradun' },
  Other: { lat: 12.9716, lng: 77.5946, defaultCity: 'Bengaluru' },
}

// Reverse geocode: Coordinates -> City & State
const reverseGeocodeLocation = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && data.address) {
        const addr = data.address
        const detectedCity =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.village ||
          addr.suburb ||
          addr.county ||
          addr.state_district ||
          ''
        const detectedState = addr.state || ''
        return { city: detectedCity, state: detectedState }
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err)
  }
  return null
}

// Forward geocode: City & State -> Coordinates
const forwardGeocodeCity = async (city: string, state: string) => {
  if (!city.trim()) return null
  try {
    const query = `${city.trim()}, ${state ? state + ', ' : ''}India`
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && data.length > 0) {
        return {
          lat: Number(parseFloat(data[0].lat).toFixed(5)),
          lng: Number(parseFloat(data[0].lon).toFixed(5)),
        }
      }
    }
  } catch (err) {
    console.warn('Forward geocoding error:', err)
  }
  return null
}

const createPickerPin = (role: UserRole) => {
  const bg =
    role === 'facility'
      ? 'bg-emerald-700'
      : role === 'municipality'
      ? 'bg-purple-600'
      : 'bg-emerald-600'

  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 rounded-full ${bg}/30 animate-ping"></div>
        <div class="h-8 w-8 rounded-2xl ${bg} text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

// Subcomponent: Map click listener
const MapClickHandler: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)))
    },
  })
  return null
}

// Subcomponent: Smooth recenter when coordinates change
const MapRecenter: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    map.flyTo(coords, Math.max(map.getZoom(), 12), { duration: 0.6 })
  }, [coords, map])
  return null
}

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('generator')

  // Contact Inputs
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Location & Coordinates
  const [stateName, setStateName] = useState('Karnataka')
  const [cityName, setCityName] = useState('Bengaluru')
  const [latitude, setLatitude] = useState<number>(12.9716)
  const [longitude, setLongitude] = useState<number>(77.5946)

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation & Error states
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [cityError, setCityError] = useState('')
  const [coordsError, setCoordsError] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  // Handler: When user selects State from dropdown
  const handleStateChange = async (selectedState: string) => {
    setStateName(selectedState)
    const defaults = STATE_COORDINATES[selectedState]
    if (defaults) {
      setCityName(defaults.defaultCity)
      setCityError('')
      setLatitude(defaults.lat)
      setLongitude(defaults.lng)
      setCoordsError('')
    }
  }

  // Effect: When user manually types in City name, geocode and move map pin
  useEffect(() => {
    if (!cityName.trim() || cityName.trim().length < 3) return

    const timer = setTimeout(async () => {
      const coords = await forwardGeocodeCity(cityName, stateName)
      if (coords) {
        setLatitude(coords.lat)
        setLongitude(coords.lng)
        setCoordsError('')
      }
    }, 650)

    return () => clearTimeout(timer)
  }, [cityName, stateName])

  // Handler: When user clicks GPS button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    const toastId = toast.loading('Acquiring precise GPS location...')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5))
        const lng = Number(pos.coords.longitude.toFixed(5))
        setLatitude(lat)
        setLongitude(lng)
        setCoordsError('')

        // Reverse-geocode to auto-populate City and State
        const geoInfo = await reverseGeocodeLocation(lat, lng)
        if (geoInfo) {
          if (geoInfo.city) {
            setCityName(geoInfo.city)
            setCityError('')
          }
          if (geoInfo.state) {
            const matchedState = Object.keys(STATE_COORDINATES).find(
              (s) =>
                s.toLowerCase() === geoInfo.state.toLowerCase() ||
                geoInfo.state.toLowerCase().includes(s.toLowerCase())
            )
            if (matchedState) {
              setStateName(matchedState)
            }
          }
          toast.success(`GPS set: ${geoInfo.city || 'Location'} (${lat}, ${lng})`, { id: toastId })
        } else {
          toast.success(`Location set: ${lat}, ${lng}`, { id: toastId })
        }
      },
      (err) => {
        toast.error(`GPS Error: ${err.message}`, { id: toastId })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Handler: When user clicks anywhere on Leaflet map
  const handleMapPinPick = async (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setCoordsError('')

    // Reverse-geocode to sync City and State input fields
    const geoInfo = await reverseGeocodeLocation(lat, lng)
    if (geoInfo) {
      if (geoInfo.city) {
        setCityName(geoInfo.city)
        setCityError('')
      }
      if (geoInfo.state) {
        const matchedState = Object.keys(STATE_COORDINATES).find(
          (s) =>
            s.toLowerCase() === geoInfo.state.toLowerCase() ||
            geoInfo.state.toLowerCase().includes(s.toLowerCase())
        )
        if (matchedState) {
          setStateName(matchedState)
        }
      }
    }
  }

  const validateName = (val: string): boolean => {
    if (!val.trim()) {
      setNameError('Full name or Organization name is required')
      return false
    }
    if (val.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return false
    }
    setNameError('')
    return true
  }

  const validatePhone = (val: string): boolean => {
    if (val.trim() && val.trim().length < 7) {
      setPhoneError('Please enter a valid phone number')
      return false
    }
    setPhoneError('')
    return true
  }

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!val.trim()) {
      setEmailError('Email address is required')
      return false
    }
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required')
      return false
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
    return true
  }

  const validateConfirmPassword = (val: string): boolean => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password')
      return false
    }
    if (val !== password) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
    return true
  }

  const validateCity = (val: string): boolean => {
    if (!val.trim()) {
      setCityError('City name is required')
      return false
    }
    setCityError('')
    return true
  }

  const validateCoords = (lat: number, lng: number): boolean => {
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setCoordsError('Latitude must be between -90 and 90')
      return false
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setCoordsError('Longitude must be between -180 and 180')
      return false
    }
    setCoordsError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isNameOk = validateName(name)
    const isPhoneOk = validatePhone(phone)
    const isEmailOk = validateEmail(email)
    const isPassOk = validatePassword(password)
    const isConfirmOk = validateConfirmPassword(confirmPassword)
    const isCityOk = validateCity(cityName)
    const isCoordsOk = validateCoords(latitude, longitude)

    if (!isNameOk || !isPhoneOk || !isEmailOk || !isPassOk || !isConfirmOk || !isCityOk || !isCoordsOk) {
      toast.error('Please fix the validation errors in the form')
      return
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone: phone.trim() || undefined,
        state: stateName,
        city: cityName,
        locationLat: latitude,
        locationLng: longitude,
      }

      // 1. Call auth service
      const session = await authService.register(payload)
      // 2. Sync to React auth context
      await register(payload)

      toast.success(`Account created! Welcome, ${session.user.name} (${role.toUpperCase()})`)

      if (role === 'generator') {
        navigate('/generator/dashboard', { replace: true })
      } else if (role === 'facility') {
        navigate('/facility/dashboard', { replace: true })
      } else if (role === 'municipality') {
        navigate('/municipal/overview', { replace: true })
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please verify your details.'
      setApiError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#081b11] font-sans antialiased text-slate-100 overflow-hidden">
      {/* LEFT SIDE: Fixed Brand & Value Proposition (Dark Forest Green) */}
      <div className="w-full lg:w-5/12 h-full max-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-[#071c12] shrink-0 border-b lg:border-b-0 lg:border-r border-emerald-900/40 select-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-1 flex items-center justify-center shadow-inner">
            <img src="/logo.png" alt="EcoTrace Logo" className="h-full w-full object-contain" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-heading">
            EcoTrace
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-10 lg:my-0 max-w-md space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
            Join the
            <br />
            circular network.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed font-normal">
            Connect organic feedstock streams directly to certified anaerobic digestion, pyrolysis, and composting facilities across India.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Instant matching engine for feedstock offtake</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automated CO2e avoidance calculation &amp; registry</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct fleet dispatch route optimization</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-xs text-emerald-300/40">
          Role-guarded &bull; AES Encrypted &bull; 100% PCB Compliant
        </div>
      </div>

      {/* RIGHT SIDE: Scrollable Registration Form (Clean Light Canvas) */}
      <div className="w-full lg:w-7/12 h-full min-h-0 overflow-y-auto p-6 sm:p-12 lg:p-16 bg-[#f9fafb] text-slate-900 flex flex-col items-center">
        <div className="w-full max-w-xl my-auto space-y-6 py-6">
          {/* Top Pill Switcher: Sign In vs Create Account */}
          <div className="flex p-1 bg-slate-200/70 rounded-full w-full max-w-xs mx-auto text-xs font-bold">
            <Link
              to="/login"
              className="flex-1 py-2 text-center rounded-full text-slate-600 hover:text-slate-900 transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-center rounded-full bg-[#1b5e39] text-white shadow-xs transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>

          {/* Form Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Create an account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your role and enroll in the circular value chain
            </p>
          </div>

          {/* Error Alert Banner */}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole('generator')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  role === 'generator'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sprout className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Generator</span>
                  <span className="text-[10px] text-slate-500 leading-tight block">Farms / Food</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('facility')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  role === 'facility'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Factory className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Facility</span>
                  <span className="text-[10px] text-slate-500 leading-tight block">Biogas / Biochar</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('municipality')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  role === 'municipality'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Municipality</span>
                  <span className="text-[10px] text-slate-500 leading-tight block">Gov / Audit</span>
                </div>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {role === 'generator'
                    ? 'Farm / Business Name'
                    : role === 'facility'
                    ? 'Plant / Facility Name'
                    : 'Authority / Officer Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) validateName(e.target.value)
                  }}
                  onBlur={() => validateName(name)}
                  placeholder={role === 'generator' ? 'GreenAgro Farms' : 'CleanBio Energy'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border ${
                    nameError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
                />
                {nameError && <p className="text-[10px] text-red-500">{nameError}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (phoneError) validatePhone(e.target.value)
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all"
                />
                {phoneError && <p className="text-[10px] text-red-500">{phoneError}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border ${
                  emailError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
              />
              {emailError && <p className="text-[10px] text-red-500">{emailError}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) validatePassword(e.target.value)
                    }}
                    onBlur={() => validatePassword(password)}
                    placeholder="••••••••••••"
                    className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-xs bg-white border ${
                      passwordError
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {passwordError && <p className="text-[10px] text-red-500">{passwordError}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (confirmPasswordError) validateConfirmPassword(e.target.value)
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    placeholder="••••••••••••"
                    className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-xs bg-white border ${
                      confirmPasswordError
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[10px] text-red-500">{confirmPasswordError}</p>
                )}
              </div>
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  State / Region
                </label>
                <select
                  value={stateName}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {Object.keys(STATE_COORDINATES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  City / District
                </label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => {
                    setCityName(e.target.value)
                    if (cityError) validateCity(e.target.value)
                  }}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                {cityError && <p className="text-[10px] text-red-500">{cityError}</p>}
              </div>
            </div>

            {/* Geo Location Map Picker */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Operating Coordinates: <span className="font-mono text-emerald-800 lowercase font-normal">{latitude}, {longitude}</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all cursor-pointer"
                >
                  <Crosshair className="h-3 w-3" />
                  <span>Use GPS</span>
                </button>
              </div>

              {/* Leaflet Map Preview */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner z-0">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  <MapClickHandler onPick={handleMapPinPick} />
                  <MapRecenter coords={[latitude, longitude]} />
                  <Marker
                    position={[latitude, longitude]}
                    icon={createPickerPin(role)}
                  />
                </MapContainer>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-600 border border-slate-200 z-[1000]">
                  Click anywhere on map to reposition pin
                </div>
              </div>
              {coordsError && <p className="text-[10px] text-red-500">{coordsError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1b5e39] hover:bg-[#154c2e] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-900/20 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#1b5e39] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
