import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtext,
  trend
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E3E8F0] p-4.5 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <span className="text-[11px] font-semibold text-[#697386] tracking-wider uppercase">
            {label}
          </span>
          <div className="w-8.5 h-8.5 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#3978F6] shrink-0">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#202638] font-mono tabular-nums tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-[#17845D]' : 'text-[#C94353]'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
      {subtext && (
        <p className="text-[11px] sm:text-xs text-[#697386] mt-2 leading-snug">
          {subtext}
        </p>
      )}
    </div>
  );
};
