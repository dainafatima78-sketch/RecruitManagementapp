import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#202638]">
          {label}
          {props.required && <span className="text-[#C94353] ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#697386]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg border bg-white text-sm text-[#202638] placeholder:text-[#697386]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            icon ? 'pl-9.5 pr-3 py-2' : 'px-3 py-2'
          } ${
            error
              ? 'border-[#C94353] focus:border-[#C94353] focus:ring-[#C94353]/20'
              : 'border-[#E3E8F0] hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-[#C94353] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#697386]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
