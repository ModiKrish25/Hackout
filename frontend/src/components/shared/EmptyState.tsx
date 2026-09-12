import React from 'react'
import { Link } from 'react-router-dom'
import { Inbox, Plus } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ElementType
  actionLabel?: string
  actionLink?: string
  onAction?: () => void
  actionIcon?: React.ElementType
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionLink,
  onAction,
  actionIcon: ActionIcon = Plus,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto border border-slate-200/90 ${className}`}
    >
      <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <Icon className="h-7 w-7 stroke-[1.8]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading tracking-tight">{title}</h3>
        {description && <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>}
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ActionIcon className="h-4 w-4" />
              <span>{actionLabel}</span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ActionIcon className="h-4 w-4" />
              <span>{actionLabel}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default EmptyState
