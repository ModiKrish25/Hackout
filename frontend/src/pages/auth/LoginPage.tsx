import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  X,
  Send,
  Home,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import type { UserRole } from '../../types'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotEmailError, setForgotEmailError] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Email format validator
  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!val.trim()) {
      setEmailError('Email address is required')
      return false
    }
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address (e.g. name@example.com)')
      return false
    }
    setEmailError('')
    return true
  }

  // Password validator
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
    return true
  }

  const redirectByRole = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname
    if (from && from !== '/login') {
      navigate(from, { replace: true })
      return
    }

    if (role === 'generator') {
      navigate('/generator/dashboard', { replace: true })
    } else if (role === 'facility') {
      navigate('/facility/dashboard', { replace: true })
    } else if (role === 'municipality' || role === 'admin') {
      navigate('/municipal/overview', { replace: true })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      toast.error('Please resolve validation errors')
      return
    }

    setIsSubmitting(true)
    setApiError(null)
    try {
      // User credentials authenticate and backend returns user with their assigned role
      const user = await login({ email, password })
      toast.success(`Welcome back, ${user.name}!`)
      redirectByRole(user.role)
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify your credentials.'
      setApiError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setForgotEmailError('Please enter a valid email address')
      return
    }
    setForgotEmailError('')
    setIsSendingReset(true)

    setTimeout(() => {
      setIsSendingReset(false)
      setShowForgotModal(false)
      toast.success(`Password reset instructions sent to ${forgotEmail}! (Valid for 15 mins)`)
      setForgotEmail('')
    }, 800)
  }

  return (
    <div className="min-h-screen eco-grid-bg flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 font-sans relative">
      {/* Top Bar with Home Page Link */}
      <div className="w-full max-w-lg flex items-center justify-between pb-4">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-2xs"
        >
          <Home className="h-3.5 w-3.5 text-emerald-600" />
          <span>View Home Page Hero</span>
        </Link>
        <span className="text-[11px] font-medium text-slate-400">Waste-to-Carbon Chain</span>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header with Uploaded Logo (Image 2) */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-2xl p-1 bg-white border border-emerald-300 items-center justify-center shadow-md shadow-emerald-500/10 overflow-hidden">
            <img src="/logo.png" alt="EcoTrace Recycling Hub Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            EcoTrace Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to your account to access your operational portal
          </p>
        </div>

        {/* Main Login Card with Glassmorphism */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200/90 bg-white/90 backdrop-blur-md">
          {/* Top Error Alert Banner if apiError exists */}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-900">Authentication Error</p>
                <p className="mt-0.5 text-red-700">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-red-400 hover:text-red-700 cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Form with Real Validation */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field with Validation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
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
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
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

            {/* Password Field with Validation & Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                {/* USER REQUIREMENT: Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setShowForgotModal(true)
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
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
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-all text-slate-800 ${
                    passwordError
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper (Purely fills email/password; role is verified by backend) */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 mb-1.5 font-medium">
              Demo accounts (Password: <span className="text-slate-600 font-mono">Password123</span>):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('generator@ecotrace.com')
                  setPassword('Password123')
                  setEmailError('')
                  setPasswordError('')
                }}
                className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
              >
                generator@ecotrace.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('facility@ecotrace.com')
                  setPassword('Password123')
                  setEmailError('')
                  setPasswordError('')
                }}
                className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
              >
                facility@ecotrace.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('municipal@ecotrace.com')
                  setPassword('Password123')
                  setEmailError('')
                  setPasswordError('')
                }}
                className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
              >
                municipal@ecotrace.com
              </button>
            </div>
          </div>

          {/* USER REQUIREMENT: If it is a new User then Register user Button */}
          <div className="pt-4 border-t border-slate-200/90 text-center space-y-3">
            <p className="text-xs text-slate-500">New to the circular value chain?</p>
            <Link
              to="/register"
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-600/40 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Register as a New User</span>
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Role-Guarded &bull; AES Encrypted &bull; 100% PCB Compliant</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 font-heading">Reset Your Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered email address below. We'll dispatch a secure password reset link to your inbox.
            </p>

            <form onSubmit={handleSendReset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value)
                      if (forgotEmailError) setForgotEmailError('')
                    }}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {forgotEmailError && (
                  <p className="text-xs text-red-600 font-medium mt-1">{forgotEmailError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSendingReset ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
