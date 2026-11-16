import React, { useState } from 'react';
import {
  X,
  Shield,
  Copy,
  Check,
  Share2,
  Sparkles,
  Download,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { GeneratedTeamConcept, VIBE_METADATA } from '../../services/teamGenerator';
import { sounds } from './AudioEffects';

interface IdentityPreviewModalProps {
  concept: GeneratedTeamConcept | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (concept: GeneratedTeamConcept) => void;
}

export const IdentityPreviewModal: React.FC<IdentityPreviewModalProps> = ({
  concept,
  isOpen,
  onClose,
  isSaved,
  onToggleSave
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !concept) return null;

  const meta = VIBE_METADATA[concept.vibe];

  const handleCopyCard = () => {
    sounds.playCopy();
    const summary =
      `⚡ TEAM IDENTITY CARD\n` +
      `---------------------------\n` +
      `Team Name: ${concept.name}\n` +
      `Acronym: ${concept.acronym}\n` +
      `Vibe: ${concept.vibe}\n` +
      `Algorithm Formula: ${concept.patternUsed}\n` +
      `Motto: "${concept.tagline}"\n` +
      `Components: [Adjective: ${concept.adjective}] + [Noun: ${concept.noun}]${
        concept.keyword ? ` + [Keyword: ${concept.keyword}]` : ''
      }\n` +
      `---------------------------`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top bar */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">⚡ Team Identity Sheet</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Card Display */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Card Mockup */}
          <div
            className="relative rounded-3xl p-6 border text-center overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(145deg, #111A32 0%, #0B1020 100%)`,
              borderColor: `${meta.accentColor}40`
            }}
          >
            {/* Ambient inner glow */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: meta.accentColor }}
            />

            {/* Crest / Avatar */}
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 mb-4 bg-gradient-to-tr from-slate-900 to-slate-800">
              <span
                className="text-2xl font-black tracking-widest"
                style={{ color: meta.accentColor }}
              >
                {concept.acronym}
              </span>
            </div>

            {/* Team Name */}
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {concept.name}
            </h3>

            {/* Vibe badge & Acronym */}
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${meta.accentColor}20`,
                  borderColor: `${meta.accentColor}50`,
                  color: meta.accentColor
                }}
              >
                {concept.vibe}
              </span>
              <span className="text-xs font-mono text-slate-400">
                CODEX: {concept.acronym}
              </span>
            </div>

            {/* Slogan */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-xs sm:text-sm italic text-slate-300">
                "{concept.tagline}"
              </p>
            </div>

            {/* Formula Breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px] bg-slate-950/50 p-3 rounded-xl border border-white/5 font-mono">
              <div>
                <span className="text-slate-500 block">Adjective:</span>
                <span className="text-cyan-300 font-semibold">{concept.adjective}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Noun:</span>
                <span className="text-violet-300 font-semibold">{concept.noun}</span>
              </div>
              {concept.keyword && (
                <div className="col-span-2 pt-1 border-t border-white/5">
                  <span className="text-slate-500 block">Custom Keyword:</span>
                  <span className="text-lime-300 font-semibold">{concept.keyword}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCopyCard}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center space-x-2 border border-white/10 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-lime-400" />
                  <span className="text-lime-300">Identity Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copy Identity Card</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playFavorite();
                onToggleSave(concept);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-lime-950/60 border-lime-400/50 text-lime-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-white'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-lime-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

