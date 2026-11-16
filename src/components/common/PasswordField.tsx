import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? `password-${label.toLowerCase().replace(/\s+/g, '-')}` : 'password-input');

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#202638]">
          {label}
          {props.required && <span className="text-[#C94353] ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#697386]">
          <Lock className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`block w-full rounded-lg border bg-white pl-9.5 pr-10 py-2 text-sm text-[#202638] placeholder:text-[#697386]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6] disabled:bg-slate-50 disabled:cursor-not-allowed ${
            error
              ? 'border-[#C94353] focus:border-[#C94353] focus:ring-[#C94353]/20'
              : 'border-[#E3E8F0] hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#697386] hover:text-[#202638] focus:outline-none transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-[#C94353] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#697386]">{helperText}</p>
      ) : null}
    </div>
  );
});

PasswordField.displayName = 'PasswordField';
