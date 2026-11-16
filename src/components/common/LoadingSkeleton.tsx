import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E3E8F0] overflow-hidden">
      <div className="h-11 bg-[#F8FAFD] border-b border-[#E3E8F0] flex items-center px-4 gap-4 animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 bg-slate-200 rounded-sm flex-1" />
        ))}
      </div>
      <div className="divide-y divide-[#E3E8F0]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 px-4 flex items-center gap-4 animate-pulse">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-slate-100 rounded-sm"
                style={{ width: `${Math.max(40, (c * 17 + 55) % 90)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 bg-slate-200 rounded-sm" />
        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-7 w-28 bg-slate-200 rounded-sm" />
      <div className="h-2.5 w-36 bg-slate-100 rounded-sm" />
    </div>
  );
};
