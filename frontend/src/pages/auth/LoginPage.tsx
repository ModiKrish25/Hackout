import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  X,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/auth.service'
import toast from 'react-hot-toast'
import type { UserRole } from '../../types'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation & Error states
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
      return
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      // Call authentication service
      const session = await authService.login({ email, password })
      // Update Auth context state
      await login({ email, password })

      toast.success(`Welcome back, ${session.user.name}!`)
      redirectByRole(session.user.role)
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

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Password123!')
    setIsSubmitting(true)
    setApiError(null)

    try {
      const session = await authService.login({ email: demoEmail, password: 'Password123!' })
      await login({ email: demoEmail, password: 'Password123!' })
      toast.success(`Logged in as ${session.user.name} (${session.user.role.toUpperCase()})`)
      redirectByRole(session.user.role)
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Demo login failed'
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
      toast.success(`Password reset instructions sent to ${forgotEmail}!`)
      setForgotEmail('')
    }, 800)
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#081b11] font-sans antialiased text-slate-100 overflow-hidden">
      {/* LEFT SIDE: Fixed Brand & Value Proposition (Dark Forest Green) */}
      <div className="w-full lg:w-1/2 h-full max-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-[#071c12] shrink-0 border-b lg:border-b-0 lg:border-r border-emerald-900/40 select-none">
        {/* Subtle Background Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-1 flex items-center justify-center shadow-inner">
            <img src="/logo.png" alt="Waste2Carbon Logo" className="h-full w-full object-contain" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-heading">
            Waste<span className="text-emerald-400">2Carbon</span>
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
            Track waste.
            <br />
            Optimise chains.
            <br />
            Hit your targets.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed font-normal">
            Enterprise-grade organic waste tracking with AI-powered logistics &amp; certified carbon value generation for circular teams nationwide.
          </p>

          {/* Value Bullet Points */}
          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Real-time organic feedstock &amp; moisture auditing</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>AI-powered supply chain &amp; TSP fleet route optimization</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Verra &amp; Gold Standard compliant carbon record issuance</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Municipal spatial density heatmaps &amp; compliance reporting</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-xs text-emerald-300/40">
          Trusted by certified agro-producers, bio-conversion plants &amp; municipal regulators.
        </div>
      </div>

      {/* RIGHT SIDE: Scrollable Authentication Card (Clean Light Canvas) */}
      <div className="w-full lg:w-1/2 h-full min-h-0 overflow-y-auto p-6 sm:p-12 lg:p-16 bg-[#f9fafb] text-slate-900 flex flex-col items-center">
        <div className="w-full max-w-md my-auto space-y-6 py-6">
          {/* Top Pill Switcher: Sign In vs Create Account */}
          <div className="flex p-1 bg-slate-200/70 rounded-full w-full max-w-xs mx-auto text-xs font-bold">
            <button
              type="button"
              className="flex-1 py-2 text-center rounded-full bg-[#1b5e39] text-white shadow-xs transition-all cursor-pointer"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 text-center rounded-full text-slate-600 hover:text-slate-900 transition-all"
            >
              Create Account
            </Link>
          </div>

          {/* Form Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in to your circular value chain dashboard
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email
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
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                  emailError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
              />
              {emailError && <p className="text-[11px] font-medium text-red-500">{emailError}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Password
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
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white border ${
                    passwordError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] font-medium text-red-500">{passwordError}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1b5e39] hover:bg-[#154c2e] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-900/20 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#f9fafb] px-3 text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Quick Demo Login Action */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('greenharvest@example.com')}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0e271a] hover:bg-[#143524] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Quick Demo (Green Harvest Agro Producer)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('cleanbio@example.com')}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span>Quick Demo (CleanBio Biogas Facility)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('municipality@example.com')}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Quick Demo (BBMP Municipal Corporation)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setShowForgotModal(false)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Reset your password
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered email address to receive password reset instructions.
              </p>

              <form onSubmit={handleSendReset} className="space-y-3 pt-2">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
                {forgotEmailError && (
                  <p className="text-[11px] text-red-500">{forgotEmailError}</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1b5e39] hover:bg-[#154c2e]"
                  >
                    {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default LoginPage
