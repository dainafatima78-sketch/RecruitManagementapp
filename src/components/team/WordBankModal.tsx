import React, { useState } from 'react';
import { X, Search, Sparkles, Copy, Check, ArrowRight, BookOpen } from 'lucide-react';
import {
  ADJECTIVES,
  NOUNS,
  VIBE_METADATA,
  VibeType
} from '../../services/teamGenerator';
import { sounds } from './AudioEffects';

interface WordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKeyword: (word: string) => void;
}

export const WordBankModal: React.FC<WordBankModalProps> = ({
  isOpen,
  onClose,
  onSelectKeyword
}) => {
  const [activeVibe, setActiveVibe] = useState<VibeType>('Tech');
  const [search, setSearch] = useState<string>('');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (word: string) => {
    sounds.playCopy();
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const handleUse = (word: string) => {
    sounds.playClick();
    onSelectKeyword(word);
    onClose();
  };

  const adjs = ADJECTIVES[activeVibe].filter((w) =>
    w.toLowerCase().includes(search.toLowerCase())
  );
  const nouns = NOUNS[activeVibe].filter((w) =>
    w.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Original Word Banks Explorer</h2>
              <p className="text-xs text-slate-400">
                Curated lexicons directly loaded from <code className="text-cyan-300">Team name generater.ipynb</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vibe Tabs & Search Bar */}
        <div className="p-6 pb-2 border-b border-white/5 space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['Tech', 'Creative', 'Business / Professional', 'Bold & Fierce'] as VibeType[]).map((vibe) => (
              <button
                key={vibe}
                onClick={() => {
                  sounds.playClick();
                  setActiveVibe(vibe);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeVibe === vibe
                    ? 'bg-gradient-to-r from-violet-600/40 to-cyan-500/40 text-cyan-200 border-cyan-400/50 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words in this bank..."
              className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Content Lists */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Adjectives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Adjectives ({adjs.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click word to set as keyword</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {adjs.map((word) => (
                <div
                  key={word}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-white/5 hover:border-cyan-400/30 transition-all text-xs"
                >
                  <span className="font-semibold text-white">{word}</span>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleCopy(word)}
                      title="Copy"
                      className="p-1 hover:text-cyan-300 text-slate-400"
                    >
                      {copiedWord === word ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleUse(word)}
                      title="Use as Keyword"
                      className="p-1 hover:text-cyan-300 text-slate-400 flex items-center"
                    >
                      <ArrowRight className="w-3 h-3 text-violet-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nouns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Nouns ({nouns.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click word to set as keyword</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {nouns.map((word) => (
                <div
                  key={word}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-white/5 hover:border-violet-400/30 transition-all text-xs"
                >
                  <span className="font-semibold text-white">{word}</span>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleCopy(word)}
                      title="Copy"
                      className="p-1 hover:text-cyan-300 text-slate-400"
                    >
                      {copiedWord === word ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleUse(word)}
                      title="Use as Keyword"
                      className="p-1 hover:text-cyan-300 text-slate-400 flex items-center"
                    >
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
          <span>Combinatorial space: Over 800+ core name pairings</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

