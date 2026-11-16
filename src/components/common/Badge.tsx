import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'cobalt';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    success: 'bg-[#17845D]/10 text-[#17845D] border border-[#17845D]/20',
    warning: 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20',
    error: 'bg-[#C94353]/10 text-[#C94353] border border-[#C94353]/20',
    info: 'bg-[#3978F6]/10 text-[#3978F6] border border-[#3978F6]/20',
    cobalt: 'bg-[#EAF1FF] text-[#3978F6] border border-[#3978F6]/30',
    neutral: 'bg-slate-100 text-[#697386] border border-slate-200'
  };

  const dotColors = {
    success: 'bg-[#17845D]',
    warning: 'bg-[#B7791F]',
    error: 'bg-[#C94353]',
    info: 'bg-[#3978F6]',
    cobalt: 'bg-[#3978F6]',
    neutral: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md whitespace-nowrap shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status.toLowerCase()) {
    case 'open':
    case 'shortlisted':
      return 'success';
    case 'in review':
    case 'intermediate':
      return 'warning';
    case 'draft':
    case 'closed':
      return 'neutral';
    case 'rejected':
      return 'error';
    case 'new':
    case 'beginner':
      return 'info';
    default:
      return 'neutral';
  }
}
