import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shuffle,
  X,
  Cpu,
  Palette,
  Briefcase,
  Flame,
  Settings2,
  HelpCircle,
  Check
} from 'lucide-react';
import {
  VibeType,
  PatternOption,
  CasingOption,
  GenerationOptions,
  VIBE_METADATA
} from '../../services/teamGenerator';
import { sounds } from './AudioEffects';

interface GeneratorFormProps {
  onGenerate: (options: GenerationOptions) => void;
  isGenerating: boolean;
  selectedVibe: VibeType | 'All';
  onVibeChange: (vibe: VibeType | 'All') => void;
  keyword: string;
  onKeywordChange: (kw: string) => void;
}

const SAMPLE_KEYWORDS = [
  'Pixel',
  'Alpha',
  'Apex',
  'Nova',
  'Quantum',
  'Vector',
  'Matrix',
  'Summit',
  'Phoenix',
  'Vanguard'
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onGenerate,
  isGenerating,
  selectedVibe,
  onVibeChange,
  keyword,
  onKeywordChange
}) => {
  const [count, setCount] = useState<number>(3);
  const [patternMode, setPatternMode] = useState<PatternOption>('auto');
  const [casing, setCasing] = useState<CasingOption>('title');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Keyboard shortcut listener (Enter triggers generation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isGenerating && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        sounds.playGenerate();
        onGenerate({
          vibe: selectedVibe,
          keyword,
          count,
          patternMode,
          casing
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVibe, keyword, count, patternMode, casing, isGenerating, onGenerate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playGenerate();
    onGenerate({
      vibe: selectedVibe,
      keyword,
      count,
      patternMode,
      casing
    });
  };

  const handleSurpriseMe = () => {
    sounds.playClick();
    const vibes: VibeType[] = ['Tech', 'Creative', 'Business / Professional', 'Bold & Fierce'];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    const randomKw = SAMPLE_KEYWORDS[Math.floor(Math.random() * SAMPLE_KEYWORDS.length)];
    onVibeChange(randomVibe);
    onKeywordChange(randomKw);
    sounds.playGenerate();
    onGenerate({
      vibe: randomVibe,
      keyword: randomKw,
      count,
      patternMode,
      casing
    });
  };

  const getVibeIcon = (vibe: VibeType) => {
    switch (vibe) {
      case 'Tech':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Creative':
        return <Palette className="w-5 h-5 text-violet-400" />;
      case 'Business / Professional':
        return <Briefcase className="w-5 h-5 text-lime-400" />;
      case 'Bold & Fierce':
        return <Flame className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10">
        {/* Subtle decorative edge lighting */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
          {/* Section 1: Industry / Vibe Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold tracking-wide text-slate-200 flex items-center space-x-2">
                <span>Vibe / Industry:</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Maps to curated adjective & noun dictionaries)
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onVibeChange(selectedVibe === 'All' ? 'Tech' : 'All');
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedVibe === 'All'
                    ? 'bg-violet-600/40 text-violet-200 border-violet-400'
                    : 'bg-slate-800/60 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {selectedVibe === 'All' ? '✓ Cross-Industry Shuffle' : 'Mix All Industries'}
              </button>
            </div>

            {/* Vibe cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['Tech', 'Creative', 'Business / Professional', 'Bold & Fierce'] as VibeType[]).map((vibe) => {
                const meta = VIBE_METADATA[vibe];
                const isSelected = selectedVibe === vibe;

                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onVibeChange(vibe);
                    }}
                    className={`relative p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[105px] group ${
                      isSelected
                        ? `bg-slate-800/90 ${meta.borderColor} ring-2 ring-cyan-400/30 shadow-lg`
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 group-hover:scale-105 transition-transform">
                        {getVibeIcon(vibe)}
                      </div>
                      {isSelected && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {meta.label}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 leading-tight mt-0.5">
                        {meta.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Custom Keyword Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="keyword-input" className="text-sm font-semibold tracking-wide text-slate-200">
                Keyword <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>

              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onKeywordChange('');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="keyword-input"
                type="text"
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                placeholder="e.g., Pixel, Alpha, Quantum (Optional)"
                className="w-full glass-input px-4 py-3.5 pl-4 pr-24 rounded-2xl text-base text-white placeholder-slate-500 transition-all font-medium"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  title="Randomize keyword & vibe"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs text-cyan-300 flex items-center space-x-1 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Random</span>
                </button>
              </div>
            </div>

            {/* Quick Keyword Suggestion Chips */}
            <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
              {SAMPLE_KEYWORDS.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onKeywordChange(word);
                  }}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all ${
                    keyword.toLowerCase() === word.toLowerCase()
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                      : 'bg-slate-900/60 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  +{word}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Fine-tuning & Algorithm Settings Toggle */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAdvanced(!showAdvanced);
              }}
              className="flex items-center space-x-2 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <span>{showAdvanced ? 'Hide Generation Controls' : 'Show Generation Controls (Pattern, Batch, Casing)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/70 border border-white/5 space-y-4">
                {/* Batch Count */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Batch Quantity:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[3, 6, 9, 12, 18].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setCount(qty);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          count === qty
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                            : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {qty} {qty === 3 ? '(Default)' : 'Names'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Selector */}
                {keyword && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      Keyword Pattern Placement:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'auto', label: 'Random Pattern (Notebook Default)', desc: 'Shuffles among the 3 algorithm patterns' },
                        { id: 'keyword-noun', label: '{Keyword} + {Noun}', desc: `e.g. ${keyword} Systems` },
                        { id: 'adj-keyword', label: '{Adjective} + {Keyword}', desc: `e.g. Cyber ${keyword}` },
                        { id: 'the-adj-keyword-noun', label: 'The {Adjective} + {Keyword} + {Noun}', desc: `e.g. The Cyber ${keyword} Systems` }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setPatternMode(item.id as PatternOption);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            patternMode === item.id
                              ? 'bg-violet-900/30 text-violet-200 border-violet-400'
                              : 'bg-slate-800/30 text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Casing Style */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Text Formatting:
                  </label>
                  <div className="flex space-x-2 text-xs">
                    {[
                      { id: 'title', label: 'Title Case (Standard)' },
                      { id: 'upper', label: 'UPPERCASE' },
                      { id: 'lower', label: 'lowercase' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setCasing(item.id as CasingOption);
                        }}
                        className={`px-3 py-1.5 rounded-xl border transition-all ${
                          casing === item.id
                            ? 'bg-lime-900/30 text-lime-300 border-lime-400'
                            : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button Replicating Notebook generate_button */}
          <div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full h-14 rounded-2xl btn-primary-glow font-bold text-base text-white flex items-center justify-center space-x-2 cursor-pointer shadow-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Forging Team Concepts...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span className="tracking-wide">Generate Team Names</span>
                  <span className="hidden sm:inline-block text-xs font-normal text-white/60 ml-2 px-2 py-0.5 rounded bg-black/20 border border-white/10">
                    Press Enter ↵
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

