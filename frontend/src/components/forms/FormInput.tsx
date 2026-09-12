import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ElementType
  rightElement?: React.ReactNode
  containerClassName?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      rightElement,
      required,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />}

          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`w-full py-2 text-sm bg-white border rounded-xl transition-all text-slate-800 focus:outline-none ${
              Icon ? 'pl-9' : 'pl-3.5'
            } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-red-400 focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
                : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
            } ${className}`}
            {...props}
          />

          {rightElement && <div className="absolute right-3 top-2.5 flex items-center">{rightElement}</div>}
        </div>

        {error ? (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput
