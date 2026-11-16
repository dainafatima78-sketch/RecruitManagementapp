import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-[#E3E8F0] ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#697386] mb-3.5 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#202638] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#697386] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
