import React from 'react';

interface BrandSymbolProps {
  className?: string;
  size?: number | string;
}

export const BrandSymbol: React.FC<BrandSymbolProps> = ({
  className = 'w-9 h-9',
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
      aria-label="RecruitAI Brand Symbol"
    >
      <defs>
        {/* Core Electric Cobalt to Cyan Gradient */}
        <linearGradient id="r-grad-1" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="60%" stopColor="#3978F6" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Luminous Forward Blade Gradient */}
        <linearGradient id="r-grad-2" x1="14" y1="44" x2="40" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Deep Velocity Anchor Gradient */}
        <linearGradient id="r-grad-3" x1="8" y1="38" x2="32" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="60%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Abstract Geometric Arc 1 - Deep Foundation Flow */}
      <path
        d="M 10 38 C 11.5 27 19.5 17.5 31 12 C 35.5 9.8 40 8.5 41.5 8.5 C 40 10.5 37 13 32 16 C 22.5 21.5 16.5 29 14.5 37.5 C 13 43.5 8.5 42.5 10 38 Z"
        fill="url(#r-grad-3)"
      />

      {/* Abstract Geometric Arc 2 - Primary Ascending Wave */}
      <path
        d="M 13 43 C 16.5 45 23 40 29.5 31.5 C 37 22 40 13 41 8 C 38 9.5 31.5 14 25 21.5 C 17.5 30 13 38 13 43 Z"
        fill="url(#r-grad-1)"
      />

      {/* Abstract Geometric Arc 3 - Precision Blade to Discovery Apex */}
      <path
        d="M 19 44 C 24 41.5 31.5 35 38 25.5 C 43.5 17 44.5 10 44 7 C 42 9.5 37 16 31 23.5 C 24.5 31.5 19 39 19 44 Z"
        fill="url(#r-grad-2)"
      />

      {/* Pure White Focus Core (Vertex of talent discovery) */}
      <circle cx="43.5" cy="7.5" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};
