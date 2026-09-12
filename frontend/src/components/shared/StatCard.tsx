import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ElementType
  trend?: {
    value: string
    isPositive?: boolean
    isNeutral?: boolean
    label?: string
  }
  progress?: {
    value: number
    max?: number
    color?: 'emerald' | 'teal' | 'blue' | 'amber'
  }
  subtitle?: string
  accentColor?: 'emerald' | 'teal' | 'blue' | 'slate'
  className?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  progress,
  subtitle,
  accentColor = 'emerald',
  className = '',
  onClick,
}) => {
  const iconColors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    teal: 'bg-teal-50 border-teal-200 text-teal-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    slate: 'bg-slate-100 border-slate-200 text-slate-700',
  }

  const progressColors = {
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  }

  return (
    <div
      onClick={onClick}
      className={`glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${iconColors[accentColor]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
          {value} {unit && <span className="text-xs font-normal text-slate-500">{unit}</span>}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold mt-1.5 ${
              trend.isNeutral
                ? 'text-slate-500'
                : trend.isPositive !== false
                ? 'text-emerald-700'
                : 'text-red-600'
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="h-3.5 w-3.5" />
            ) : trend.isPositive !== false ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{trend.value}</span>
            {trend.label && <span className="text-[11px] text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}

        {subtitle && !trend && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {progress && (
        <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressColors[progress.color || 'emerald']
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (progress.value / (progress.max || 100)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Utilization</span>
            <span>{Math.round((progress.value / (progress.max || 100)) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatCard
