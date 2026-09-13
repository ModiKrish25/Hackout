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
  Home,
  ShieldCheck,
  X,
  AlertTriangle,
  Calculator,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { CarbonCalculatorModal } from '../carbon/CarbonCalculatorModal'
import { JudgeDemoModal } from '../demo/JudgeDemoModal'

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // User Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  const [showCalculatorModal, setShowCalculatorModal] = useState(false)
  const [showJudgeDemoModal, setShowJudgeDemoModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setShowSignoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowSignoutModal(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Section: Brand Logo & Role Pill */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl p-0.5 bg-emerald-500/10 border border-emerald-300 flex items-center justify-center overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Waste2Carbon Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-heading">
                  Waste<span className="text-emerald-600">2Carbon</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Waste-to-Carbon Value Chain
              </p>
            </div>
          </Link>
        </div>

        {/* Center Section: Role-Specific Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-0.5">
          <Link
            to="/home"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              location.pathname === '/home'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            Hero Section
          </Link>

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
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                to="/generator/listings/new"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/generator/listings/new'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Post Listing
              </Link>
              <Link
                to="/generator/listings"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/generator/listings'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                My Listings
              </Link>
            </>
          )}

          {role === 'facility' && (
            <>
              <Link
                to="/facility/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/dashboard'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                to="/facility/matches"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/matches'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Incoming Matches
              </Link>
              <Link
                to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname.includes('/facility/routes')
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Route View
              </Link>
              <Link
                to="/facility/settings"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/facility/settings'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </>
          )}

          {role === 'municipality' && (
            <>
              <Link
                to="/municipal/overview"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/municipal/overview'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Overview
              </Link>
              <Link
                to="/municipal/reports"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/municipal/reports'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Reports & Export
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Live Demo, Calculator & Avatar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Interactive 60-Second Judge Pitch Demo */}
          <button
            type="button"
            onClick={() => setShowJudgeDemoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm hover:shadow-emerald-500/25 transition-all cursor-pointer"
            title="Launch 60-Second Interactive Judge Pitch Demo (§Central Live Demo)"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">⚡ Live Pitch Demo</span>
            <span className="sm:hidden">⚡ Demo</span>
          </button>

          {/* Quick Access Carbon Calculator Simulator */}
          <button
            type="button"
            onClick={() => setShowCalculatorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
            title="Open Interactive Carbon Accounting Simulator (§6, §24)"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden md:inline">Carbon Calculator</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
            >
              <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">{user?.name?.split(' ')[0] || 'User'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                {/* User Info Header */}
                <div className="p-2 border-b border-slate-100 text-xs">
                  <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-bold uppercase">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Role: {role}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Profile &amp; Location</span>
                </Link>

                <Link
                  to="/home"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Home className="h-3.5 w-3.5 text-slate-400" />
                  <span>View Home Page Hero</span>
                </Link>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                    Are you sure you want to sign out of <span className="font-semibold text-slate-700">Waste2Carbon</span>? You will need to enter your credentials to access your dashboard again.
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

      {/* Central 60-Second Interactive Judge Pitch Demo Modal */}
      {showJudgeDemoModal && (
        <JudgeDemoModal onClose={() => setShowJudgeDemoModal(false)} />
      )}
    </header>
  )
}

export default Navbar
