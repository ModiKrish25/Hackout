import React from 'react'
import type { ListingStatus, MatchStatus } from '../../types'

type BadgeStatus = ListingStatus | MatchStatus | string

interface StatusBadgeProps {
  status: BadgeStatus
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
  className?: string
}

const STATUS_CONFIG: Record<
  string,
  {
    bg: string
    text: string
    border: string
    dot: string
    label: string
  }
> = {
  listed: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Listed',
  },
  pending: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Pending Match',
  },
  matched: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    label: 'Matched',
  },
  confirmed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
    label: 'Confirmed',
  },
  scheduled: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Scheduled',
  },
  collected: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    label: 'Collected',
  },
  processed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Processed & Sequestered',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-400',
    label: 'Declined',
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const normalizedStatus = status.toLowerCase()
  const config = STATUS_CONFIG[normalizedStatus] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: status,
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs sm:text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
        </span>
      )}
      <span>{config.label}</span>
    </span>
  )
}

export default StatusBadge
