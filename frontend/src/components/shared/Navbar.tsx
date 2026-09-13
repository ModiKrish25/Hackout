import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  Layers,
  MapPin,
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  Globe,
  ShieldCheck,
  X,
  AlertTriangle,
  Calculator,
  Menu,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { CarbonCalculatorModal } from '../carbon/CarbonCalculatorModal'

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // State
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  const [showCalculatorModal, setShowCalculatorModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown & mobile menu on route change
  useEffect(() => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignoutClick = () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    setShowSignoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowSignoutModal(false)
    logout()
    navigate('/login')
  }

  // Determine user dashboard landing path
  const dashboardPath =
    role === 'facility'
      ? '/facility/dashboard'
      : role === 'municipality' || role === 'admin'
      ? '/municipal/overview'
      : '/generator/dashboard'

  // Role pill color styling
  const roleBadgeStyles =
    role === 'facility'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : role === 'municipality' || role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200'

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-xs bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Section: EcoTrace Brand Logo & Role Pill */}
        <div className="flex items-center gap-3">
          <Link to={dashboardPath} className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl p-1 bg-emerald-500/10 border border-emerald-300/80 flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="EcoTrace Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-heading">
                  Eco<span className="text-emerald-600">Trace</span>
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${roleBadgeStyles}`}
                >
                  {role}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Waste-to-Carbon Value Chain
              </p>
            </div>
          </Link>
        </div>

        {/* Center Section: Role-Specific Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 py-0.5">
          {role === 'generator' && (
            <>
              <Link
                to="/generator/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/generator/dashboard'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-700" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/generator/listings/new"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/generator/listings/new'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-emerald-700" />
                <span>Post Waste Listing</span>
              </Link>

              <Link
                to="/generator/listings"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname.startsWith('/generator/listings') &&
                  location.pathname !== '/generator/listings/new'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5 text-emerald-700" />
                <span>My Listings</span>
              </Link>
            </>
          )}

          {role === 'facility' && (
            <>
              <Link
                to="/facility/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/dashboard'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-700" />
                <span>Facility Hub</span>
              </Link>

              <Link
                to="/facility/matches"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/matches'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-blue-700" />
                <span>Incoming Matches</span>
              </Link>

              <Link
                to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname.includes('/facility/routes')
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-blue-700" />
                <span>Route Optimization</span>
              </Link>

              <Link
                to="/facility/settings"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/settings'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Settings className="h-3.5 w-3.5 text-blue-700" />
                <span>Settings</span>
              </Link>
            </>
          )}

          {(role === 'municipality' || role === 'admin') && (
            <>
              <Link
                to="/municipal/overview"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/municipal/overview'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-purple-700" />
                <span>Regional Command</span>
              </Link>

              <Link
                to="/municipal/reports"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/municipal/reports'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-purple-700" />
                <span>Carbon Reports &amp; Ledger</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Carbon Calculator, User Profile Dropdown, & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Access Carbon Calculator Simulator */}
          <button
            type="button"
            onClick={() => setShowCalculatorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
            title="Open Interactive Carbon Accounting Simulator"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Carbon Calculator</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
            >
              <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                {/* User Info Header */}
                <div className="p-2.5 border-b border-slate-100 text-xs bg-slate-50/70 rounded-xl mb-1">
                  <p className="font-bold text-slate-900 truncate">{user?.name || 'Authorized User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-700 font-bold uppercase">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Role: {role}</span>
                  </div>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>My Profile &amp; Location</span>
                </Link>

                {/* Landing Page Link */}
                <Link
                  to="/home"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span>Public Landing Page</span>
                </Link>

                {/* Sign Out Action */}
                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleSignoutClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 lg:hidden shadow-2xs cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 pt-3 pb-2 mt-2 px-2 space-y-1 animate-in fade-in slide-in-from-top-2">
          {role === 'generator' && (
            <>
              <Link
                to="/generator/dashboard"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/generator/dashboard'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/generator/listings/new"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/generator/listings/new'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>Post Waste Listing</span>
              </Link>
              <Link
                to="/generator/listings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname.startsWith('/generator/listings') &&
                  location.pathname !== '/generator/listings/new'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ListFilter className="h-4 w-4 text-emerald-600" />
                <span>My Listings</span>
              </Link>
            </>
          )}

          {role === 'facility' && (
            <>
              <Link
                to="/facility/dashboard"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/facility/dashboard'
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                <span>Facility Hub</span>
              </Link>
              <Link
                to="/facility/matches"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/facility/matches'
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Incoming Matches</span>
              </Link>
              <Link
                to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname.includes('/facility/routes')
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Route Optimization</span>
              </Link>
              <Link
                to="/facility/settings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/facility/settings'
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Settings className="h-4 w-4 text-blue-600" />
                <span>Facility Settings</span>
              </Link>
            </>
          )}

          {(role === 'municipality' || role === 'admin') && (
            <>
              <Link
                to="/municipal/overview"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/municipal/overview'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Regional Command</span>
              </Link>
              <Link
                to="/municipal/reports"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === '/municipal/reports'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Carbon Reports &amp; Ledger</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
            <Link
              to="/profile"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleSignoutClick}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal rendered at document body level for perfect viewport centering */}
      {showSignoutModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSignoutModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon & Heading */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600 shadow-xs">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1 pr-4">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    Confirm Sign Out
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to sign out of <span className="font-semibold text-slate-700">EcoTrace</span>? You will need to enter your credentials to access your dashboard again.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSignoutModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md hover:shadow-red-500/20 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Yes, Sign Out</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Global Interactive Carbon Accounting Simulator Modal */}
      {showCalculatorModal && (
        <CarbonCalculatorModal onClose={() => setShowCalculatorModal(false)} />
      )}
    </header>
  )
}

export default Navbar
