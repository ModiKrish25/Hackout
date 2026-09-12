import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative">
        <Loader2 className={`animate-spin text-emerald-600 ${sizeClasses[size]}`} />
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-sm animate-pulse" />
      </div>
      {message && <p className="text-xs font-semibold text-slate-500">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center eco-grid-bg">
        <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/80">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-8 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-7 w-28 bg-slate-200 rounded" />
          <div className="h-2.5 w-36 bg-slate-200 rounded" />
          <div className="h-1.5 w-full bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner
