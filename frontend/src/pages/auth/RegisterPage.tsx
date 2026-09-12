import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  Lock,
  MapPin,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Phone,
  Crosshair,
  CheckCircle2,
  Home,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
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
  Punjab: { lat: 30.7333, lng: 76.7794, defaultCity: 'Chandigarh' },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, defaultCity: 'Lucknow' },
  Kerala: { lat: 8.5241, lng: 76.9366, defaultCity: 'Thiruvananthapuram' },
  'West Bengal': { lat: 22.5726, lng: 88.3639, defaultCity: 'Kolkata' },
  Other: { lat: 12.9716, lng: 77.5946, defaultCity: 'Bengaluru' },
}

// Custom Leaflet DivIcon for the interactive click-to-pin picker
const createPickerPin = (role: UserRole) => {
  const bg =
    role === 'facility'
      ? 'bg-blue-600'
      : role === 'municipality'
      ? 'bg-purple-600'
      : 'bg-emerald-600'

  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 rounded-full ${bg}/30 animate-ping"></div>
        <div class="h-9 w-9 rounded-2xl ${bg} text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
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
  // USER REQUIREMENT: Register as Generator / Facility / Municipality
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

  // Validation errors
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [cityError, setCityError] = useState('')
  const [coordsError, setCoordsError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  // Handle state change with auto city and coordinate suggestions
  const handleStateChange = (selectedState: string) => {
    setStateName(selectedState)
    const defaults = STATE_COORDINATES[selectedState]
    if (defaults) {
      if (!cityName || cityName === 'Bengaluru') {
        setCityName(defaults.defaultCity)
      }
      setLatitude(defaults.lat)
      setLongitude(defaults.lng)
    }
  }

  // Use Browser GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    toast.loading('Detecting GPS location...', { id: 'gps-loc' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5))
        const lng = Number(pos.coords.longitude.toFixed(5))
        setLatitude(lat)
        setLongitude(lng)
        setCoordsError('')
        toast.success(`Coordinates pinned: ${lat}, ${lng}`, { id: 'gps-loc' })
      },
      () => {
        toast.error('Unable to retrieve GPS. Click on the map to pin your location.', { id: 'gps-loc' })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Field Validators
  const validateName = (val: string): boolean => {
    if (!val.trim()) {
      setNameError('Full Name or Organization is required')
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
    if (!val.trim()) {
      setPhoneError('Contact phone number is required')
      return false
    }
    const cleanPhone = val.replace(/[\s\-\(\)\+]/g, '')
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setPhoneError('Please enter a valid phone number (7-15 digits)')
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

  // Handle Form Submit with Auto-login and Redirect
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

    try {
      // Auto-login happens inside context register function
      const newUser = await register({
        name,
        email,
        password,
        role,
        phone,
        state: stateName,
        city: cityName,
        location_lat: latitude,
        location_lng: longitude,
      })

      toast.success(`Account created! Welcome, ${newUser.name} (${role.toUpperCase()})`)

      // USER REQUIREMENT: Then Registered User should be entered as his selected role
      if (role === 'generator') {
        navigate('/generator/dashboard', { replace: true })
      } else if (role === 'facility') {
        navigate('/facility/dashboard', { replace: true })
      } else if (role === 'municipality') {
        navigate('/municipal/overview', { replace: true })
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen eco-grid-bg flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 font-sans relative">
      {/* Top Navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-2xs"
        >
          <Home className="h-3.5 w-3.5 text-emerald-600" />
          <span>Home Page Hero</span>
        </Link>
        <Link
          to="/login"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Already registered? Sign in &rarr;
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-2xl p-1 bg-white border border-emerald-300 items-center justify-center shadow-md shadow-emerald-500/10 overflow-hidden">
            <img src="/logo.png" alt="EcoTrace Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            Register for EcoTrace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the decentralized waste-to-carbon accounting and off-take network
          </p>
        </div>

        {/* Main Register Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200/90 bg-white/90 backdrop-blur-md">
          {/* USER REQUIREMENT: Register as Generator / Facility / Municipality Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Register As:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-100/90 border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('generator')}
                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'generator'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Generator</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('facility')}
                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'facility'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Facility</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('municipality')}
                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'municipality'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Municipality</span>
              </button>
            </div>

            {/* Role Context Pill */}
            <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium">
                {role === 'generator' && 'Post waste batches, browse offtake facilities, receive carbon credits'}
                {role === 'facility' && 'Ingest feedstock, optimize processing capacity, dispatch collection trucks'}
                {role === 'municipality' && 'Track regional diversion, monitor GIS density heatmaps, view ESG reports'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Contact Inputs */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                1. Organization &amp; Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name / Organization */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (nameError) validateName(e.target.value)
                      }}
                      onBlur={() => validateName(name)}
                      placeholder={role === 'generator' ? 'GreenAgro Organics Farm' : role === 'facility' ? 'BioVeda Energy Plant' : 'Municipal Waste Board'}
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                        nameError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Contact Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        if (phoneError) validatePhone(e.target.value)
                      }}
                      onBlur={() => validatePhone(phone)}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                        phoneError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work / Official Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) validateEmail(e.target.value)
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="contact@organization.com"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                      emailError
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError) validatePassword(e.target.value)
                      }}
                      onBlur={() => validatePassword(password)}
                      placeholder="Min 6 characters"
                      className={`w-full pl-9 pr-9 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                        passwordError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600 font-medium mt-1">{passwordError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (confirmPasswordError) validateConfirmPassword(e.target.value)
                      }}
                      onBlur={() => validateConfirmPassword(confirmPassword)}
                      placeholder="Re-enter password"
                      className={`w-full pl-9 pr-9 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                        confirmPasswordError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-600 font-medium mt-1">{confirmPasswordError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Interactive Click-To-Pin Map */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  2. Operational Location &amp; GIS Pin
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Pin My Current GPS</span>
                </button>
              </div>

              {/* State & City selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800"
                  >
                    {Object.keys(STATE_COORDINATES).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => {
                        setCityName(e.target.value)
                        if (cityError) validateCity(e.target.value)
                      }}
                      onBlur={() => validateCity(cityName)}
                      placeholder="e.g. Bengaluru, Mysuru"
                      className={`w-full pl-8 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                        cityError ? 'border-red-400' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {cityError && (
                    <p className="text-[11px] text-red-600 font-medium mt-0.5">{cityError}</p>
                  )}
                </div>
              </div>

              {/* Interactive Click-to-Pin Leaflet Map */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    Click anywhere on the map to set your location pin:
                  </span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>

                <div className="relative h-56 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      maxZoom={19}
                    />
                    <MapClickHandler
                      onPick={(lat, lng) => {
                        setLatitude(lat)
                        setLongitude(lng)
                        setCoordsError('')
                      }}
                    />
                    <MapRecenter coords={[latitude, longitude]} />
                    <Marker
                      position={[latitude, longitude]}
                      icon={createPickerPin(role)}
                    />
                  </MapContainer>

                  <div className="absolute bottom-2 left-2 z-[500] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-sm pointer-events-none">
                    🎯 Tap map to adjust coordinates
                  </div>
                </div>

                {/* Coordinate inputs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setLatitude(val)
                        validateCoords(val, longitude)
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setLongitude(val)
                        validateCoords(latitude, val)
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {coordsError && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {coordsError}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                'Registering & Logging in...'
              ) : (
                <>
                  <span>Register &amp; Launch {role.charAt(0).toUpperCase() + role.slice(1)} Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
