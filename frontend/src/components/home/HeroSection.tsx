import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout,
  Apple,
  Milk,
  Factory,
  CalendarClock,
  Award,
  Flame,
  Recycle,
  Truck,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Map,
  BarChart3,
  Users,
  Car,
  Navigation,
  FileSpreadsheet,
  ArrowRight,
  Phone,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

interface HeroCardItem {
  id: string
  icon: React.ElementType
  title: string
  link: string
  badgeText?: string
}

interface RoleHeroData {
  role: UserRole
  name: string
  backgroundImage: string
  badge: string
  subtitle: string
  ctaText: string
  ctaLink: string
  accentColor: string
  cardBg: string
  headlines: string[]
  cards: HeroCardItem[]
}

const HERO_DATA: Record<'generator' | 'facility' | 'municipality', RoleHeroData> = {
  generator: {
    role: 'generator',
    name: 'Waste Generator Hub',
    // USER REQUIREMENT: Image 1 Uploaded for Generator (aerial lush green bio-refining & river landscape)
    backgroundImage: '/hero-generator.jpg',
    badge: 'Agricultural Farms, Agro-Processors & Food Producers',
    subtitle:
      'Turn agricultural crop residues, commercial food organics, and livestock manure into off-take revenue and verified carbon credits with AI-matched local processing.',
    ctaText: 'Enter Generator Portal',
    ctaLink: '/generator/dashboard',
    accentColor: '#10b981',
    cardBg: 'bg-emerald-600/85 hover:bg-emerald-500/95 border-emerald-300/40',
    // USER REQUIREMENT: Middle text related to Generator that becomes blur and then changes text
    headlines: [
      '100% Organic Waste Diversion at Source',
      'Monetize Crop Stubble & Agricultural Biomass',
      'AI-Matched Off-Take with Nearest Bio-Plants',
      'Earn Certified Carbon Offset Credits',
      'Zero Organic Waste Sent to Landfills',
    ],
    cards: [
      { id: 'g1', icon: Sprout, title: 'Agricultural Residue Off-take', link: '/generator/listings/new', badgeText: 'High Demand' },
      { id: 'g2', icon: Apple, title: 'Food & Commercial Organics', link: '/generator/listings/new' },
      { id: 'g3', icon: Milk, title: 'Livestock & Dairy Manure', link: '/generator/listings/new' },
      { id: 'g4', icon: Factory, title: 'Industrial Bio-Feedstock', link: '/generator/listings' },
      { id: 'g5', icon: CalendarClock, title: 'Automated Farmgate Pickup', link: '/generator/listings' },
      { id: 'g6', icon: Award, title: 'Carbon Offset Earnings', link: '/generator/dashboard', badgeText: 'Verified' },
    ],
  },
  facility: {
    role: 'facility',
    name: 'Facility Operations',
    // USER REQUIREMENT: Image 2 Uploaded for Facility (processing plant, digesters & eco-truck with mountain sunrise)
    backgroundImage: '/hero-facility.jpg',
    badge: 'Anaerobic Digesters, Biomethanation & Pyrolysis Plants',
    subtitle:
      'Streamline raw organic feedstock intake, dynamically solve multi-stop vehicle collection routes, and maintain verified 100% PCB environmental compliance.',
    ctaText: 'Access Facility Operations',
    ctaLink: '/facility/dashboard',
    accentColor: '#14b8a6',
    cardBg: 'bg-teal-600/85 hover:bg-teal-500/95 border-teal-300/40',
    // USER REQUIREMENT: Middle text related to Facility that becomes blur and then changes text
    headlines: [
      '100% PCB & Environmental Compliance',
      'Optimize Biomass Feedstock Intake & Purity',
      'AI Multi-Stop Vehicle Route & Dispatch',
      'Maximize Anaerobic Digester Methane Yield',
      'Certified Carbon Sequestration Registry',
    ],
    cards: [
      { id: 'f1', icon: Flame, title: 'Anaerobic Biomethanation', link: '/facility/matches', badgeText: 'Biogas' },
      { id: 'f2', icon: Recycle, title: 'Pyrolysis & Biochar Hub', link: '/facility/matches' },
      { id: 'f3', icon: Truck, title: 'AI Dynamic Route Dispatch', link: '/facility/routes/today' },
      { id: 'f4', icon: FlaskConical, title: 'Feedstock Purity Analysis', link: '/facility/settings' },
      { id: 'f5', icon: Gauge, title: 'Capacity Utilization Tracker', link: '/facility/dashboard' },
      { id: 'f6', icon: ShieldCheck, title: '100% Regulatory Compliance', link: '/facility/settings', badgeText: 'PCB Certified' },
    ],
  },
  municipality: {
    role: 'municipality',
    name: 'Municipal Oversight',
    // USER REQUIREMENT: Image 3 Uploaded for Municipality (smart green city skyline with collection truck & recycling bins)
    backgroundImage: '/hero-municipality.jpg',
    badge: 'Municipal Environmental Authorities & Climate Regulators',
    subtitle:
      'Real-time spatial GIS monitoring of waste generation hotspots, zero-methane landfill diversion enforcement, and verifiable ESG carbon auditing.',
    ctaText: 'Open Municipal Command Center',
    ctaLink: '/municipal/overview',
    accentColor: '#0ea5e9',
    cardBg: 'bg-cyan-700/85 hover:bg-cyan-600/95 border-cyan-300/40',
    // USER REQUIREMENT: Middle text related to Municipality that becomes blur and then changes text
    headlines: [
      'Real-Time Regional Waste Hotspot & Density GIS',
      'Zero-Methane Landfill Diversion Mandates',
      'Automated EPA Car Equivalence Impact Audits',
      'Regional Carbon Sequestration Audit Ledger',
      'End-to-End Circular Economy Fleet Oversight',
    ],
    cards: [
      { id: 'm1', icon: Map, title: 'Spatial Waste Density Heatmaps', link: '/municipal/overview', badgeText: 'Live GIS' },
      { id: 'm2', icon: BarChart3, title: 'Zero-Methane Landfill Ledger', link: '/municipal/overview' },
      { id: 'm3', icon: Users, title: 'Generator & Facility Network', link: '/municipal/overview' },
      { id: 'm4', icon: Car, title: 'EPA Vehicle Equivalence Tracker', link: '/municipal/overview' },
      { id: 'm5', icon: Navigation, title: 'Fleet Logistics Monitoring', link: '/municipal/overview' },
      { id: 'm6', icon: FileSpreadsheet, title: 'Exportable ESG Carbon Reports', link: '/municipal/reports', badgeText: 'Audit Ready' },
    ],
  },
}

export const HeroSection: React.FC = () => {
  const { role: activeAuthRole, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Role is directly determined by the authenticated session (or default to generator for public view)
  const currentRole: 'generator' | 'facility' | 'municipality' =
    activeAuthRole === 'municipality' || activeAuthRole === 'admin'
      ? 'municipality'
      : activeAuthRole === 'facility'
      ? 'facility'
      : 'generator'

  const currentHero = HERO_DATA[currentRole]

  // Animated Blur Text state
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [isBlurring, setIsBlurring] = useState(false)

  // Reset headline index on role change
  useEffect(() => {
    setHeadlineIndex(0)
    setIsBlurring(false)
  }, [currentRole])

  // Continuous loop: blur text -> change text -> unblur text
  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: Trigger blur fade out
      setIsBlurring(true)

      // Step 2: After 450ms, update text and unblur
      setTimeout(() => {
        setHeadlineIndex((prev) => (prev + 1) % currentHero.headlines.length)
        setIsBlurring(false)
      }, 450)
    }, 3600)

    return () => clearInterval(interval)
  }, [currentHero.headlines.length, currentRole])

  const handleLaunchCTA = () => {
    if (isAuthenticated && activeAuthRole) {
      if (activeAuthRole === 'generator') {
        navigate('/generator/dashboard')
      } else if (activeAuthRole === 'facility') {
        navigate('/facility/dashboard')
      } else if (activeAuthRole === 'municipality' || activeAuthRole === 'admin') {
        navigate('/municipal/overview')
      }
    } else {
      navigate('/login')
    }
  }

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden bg-slate-950 font-sans text-white">
      {/* Background Images for all 3 roles with smooth opacity transitions */}
      {(['generator', 'facility', 'municipality'] as const).map((r) => (
        <div
          key={r}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out transform scale-105 ${
            currentRole === r ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundImage: `url('${HERO_DATA[r].backgroundImage}')`,
          }}
        />
      ))}

      {/* Atmospheric Dark Gradient Overlay so text and cards have high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/50 to-slate-950/90 pointer-events-none" />

      {/* Role-tinted radial lighting */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${currentHero.accentColor} 0%, transparent 65%)`,
        }}
      />

      {/* Top Header Navigation (Image 1 Structure with Image 2 Logo) */}
      <header className="relative z-30 w-full border-b border-white/15 backdrop-blur-md bg-black/25 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Waste2Carbon Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Waste2Carbon Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider uppercase font-heading text-white drop-shadow-md">
                  WASTE<span className="text-emerald-400">2CARBON</span>
                </span>
                <span className="text-[10px] align-super text-emerald-300 font-bold">TM</span>
              </div>
              <p className="text-[10px] text-slate-200 tracking-widest uppercase font-medium drop-shadow-xs">
                Compliance &amp; Value Chain
              </p>
            </div>
          </Link>

          {/* Navigation Links in Center */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-200">
            <Link to="/home" className="hover:text-emerald-400 transition-colors text-white">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={currentHero.ctaLink}
                  className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <span>{currentHero.name}</span>
                </Link>
                {currentRole === 'generator' && (
                  <Link to="/generator/listings" className="hover:text-emerald-400 transition-colors">
                    My Listings
                  </Link>
                )}
                {currentRole === 'facility' && (
                  <Link to="/facility/matches" className="hover:text-emerald-400 transition-colors">
                    Incoming Matches
                  </Link>
                )}
                {(currentRole === 'municipality' || activeAuthRole === 'admin') && (
                  <Link to="/municipal/reports" className="hover:text-emerald-400 transition-colors">
                    Audit Reports
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Create Account
                </Link>
              </>
            )}
          </nav>

          {/* Right Section: Phone (+91 7778040173 as in Image 1) + Launch Portal */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="tel:+917778040173"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-white/95 hover:text-emerald-300 transition-colors drop-shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>+91 7778040173</span>
            </a>

            <button
              onClick={handleLaunchCTA}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Center */}
      <div className="relative z-20 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 flex flex-col items-center text-center space-y-6">
        {/* Role Persona Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-emerald-300 text-xs font-semibold tracking-wide shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>{currentHero.badge}</span>
          {isAuthenticated && user && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 uppercase font-bold border border-emerald-400/30">
              {user.role}
            </span>
          )}
        </div>

        {/* Middle text related to the active role that blurs then changes */}
        <div className="min-h-[90px] sm:min-h-[120px] flex items-center justify-center w-full px-2">
          <h1
            className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-heading drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] transition-all duration-500 ease-in-out select-none max-w-4xl ${
              isBlurring
                ? 'opacity-0 filter blur-2xl scale-95 transform translate-y-2'
                : 'opacity-100 filter blur-0 scale-100 transform translate-y-0'
            }`}
          >
            {currentHero.headlines[headlineIndex]}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-xs sm:text-sm md:text-base text-slate-100/90 leading-relaxed drop-shadow-md font-normal">
          {currentHero.subtitle}
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleLaunchCTA}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/30 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{isAuthenticated ? currentHero.ctaText : 'Get Started with Waste2Carbon'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/25 backdrop-blur-md transition-all"
            >
              Sign In with Credentials
            </Link>
          ) : (
            <Link
              to="/profile"
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/25 backdrop-blur-md transition-all"
            >
              My Profile
            </Link>
          )}
        </div>
      </div>

      {/* Bottom 6 Floating Feature Cards tailored to the active role */}
      <div className="relative z-20 w-full px-4 sm:px-6 pb-6 pt-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {currentHero.cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.id}
                to={card.link}
                className={`group relative flex flex-col items-center justify-center text-center p-4 rounded-2xl ${currentHero.cardBg} backdrop-blur-md shadow-xl shadow-black/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer min-h-[140px]`}
              >
                {/* Optional Top Badge */}
                {card.badgeText && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-white/25 text-white uppercase tracking-wider backdrop-blur-xs">
                    {card.badgeText}
                  </span>
                )}

                {/* Line-Art Icon matching Image 1 */}
                <div className="mb-2 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                  <Icon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[1.6]" />
                </div>

                {/* Card Title */}
                <span className="text-[11px] sm:text-xs font-bold text-white leading-snug drop-shadow-sm">
                  {card.title}
                </span>

                {/* Subtle light bar at bottom */}
                <div className="absolute bottom-2 w-6 h-0.5 rounded-full bg-white/40 group-hover:w-10 group-hover:bg-white transition-all duration-300" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
