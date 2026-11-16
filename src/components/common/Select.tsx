import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#202638]">
          {label}
          {props.required && <span className="text-[#C94353] ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        <select
          ref={ref}
          id={selectId}
          className={`block w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-[#202638] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6] disabled:bg-slate-50 disabled:cursor-not-allowed ${
            error
              ? 'border-[#C94353] focus:border-[#C94353]'
              : 'border-[#E3E8F0] hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#697386]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-[#C94353] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#697386]">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
