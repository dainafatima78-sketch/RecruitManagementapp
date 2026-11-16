import React from 'react';
import { Sparkles, Cpu, Palette, Briefcase, Flame, Wand2, Compass } from 'lucide-react';

interface HeroSectionProps {
  totalGenerated: number;
  onExploreVibe: (vibe: 'Tech' | 'Creative' | 'Business / Professional' | 'Bold & Fierce') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalGenerated,
  onExploreVibe
}) => {
  return (
    <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-12 text-center overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-violet-600/20 via-cyan-500/15 to-transparent blur-[120px] pointer-events-none rounded-full animate-ambient-pulse" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-lime-400/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Origin Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 text-xs font-medium text-slate-300 shadow-inner mb-6 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-semibold">Jupyter Notebook Core</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Powered by Combinatorial Word Banks</span>
        </div>

        {/* Main Title replicating & elevating the notebook title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          ⚡ Team Name <span className="notebook-gradient-title">Forge</span>
        </h1>

        {/* Subtitle direct from notebook */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Select a vibe, add custom keywords, and generate your team identity with tailored industry aesthetics.
        </p>

        {/* Quick industry vibe pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <button
            onClick={() => onExploreVibe('Tech')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Tech & Engineering</span>
          </button>

          <button
            onClick={() => onExploreVibe('Creative')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 hover:bg-violet-900/50 hover:border-violet-400 transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Creative Studios</span>
          </button>

          <button
            onClick={() => onExploreVibe('Business / Professional')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-lime-950/40 border border-lime-400/30 text-lime-300 hover:bg-lime-900/50 hover:border-lime-300 transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business & Advisory</span>
          </button>

          <button
            onClick={() => onExploreVibe('Bold & Fierce')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400 transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Bold & Esports</span>
          </button>
        </div>

        {/* Global generation stats counter */}
        {totalGenerated > 0 && (
          <div className="mt-6 text-xs text-slate-400 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            <span>{totalGenerated.toLocaleString()} team concept{totalGenerated === 1 ? '' : 's'} forged in this session</span>
          </div>
        )}
      </div>
    </section>
  );
};

