import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { GeneratedTeamConcept, VIBE_METADATA } from '../../services/teamGenerator';
import { sounds } from './AudioEffects';

interface SavedNamesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedConcepts: GeneratedTeamConcept[];
  onRemoveSaved: (id: string) => void;
  onClearAll: () => void;
  onInspectIdentity: (concept: GeneratedTeamConcept) => void;
}

export const SavedNamesDrawer: React.FC<SavedNamesDrawerProps> = ({
  isOpen,
  onClose,
  savedConcepts,
  onRemoveSaved,
  onClearAll,
  onInspectIdentity
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopySingle = (name: string, id: string) => {
    sounds.playCopy();
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    sounds.playCopy();
    const text = savedConcepts.map((c, i) => `${i + 1}. ${c.name} (${c.vibe})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExport = () => {
    sounds.playClick();
    const content = savedConcepts
      .map(
        (c, idx) =>
          `#${idx + 1} ${c.name}\n` +
          `Vibe: ${c.vibe}\n` +
          `Acronym: ${c.acronym}\n` +
          `Tagline: "${c.tagline}"\n`
      )
      .join('\n---------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favorite-team-names-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-[#0B1020] border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <Bookmark className="w-5 h-5 text-lime-400" />
            <h2 className="text-lg font-bold text-white">Saved Favorites</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-lime-500/20 text-lime-300 border border-lime-500/30">
              {savedConcepts.length}
            </span>
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

        {/* Action Toolbar */}
        {savedConcepts.length > 0 && (
          <div className="px-6 py-3 border-b border-white/5 bg-slate-950/40 flex items-center justify-between text-xs">
            <div className="flex space-x-2">
              <button
                onClick={handleCopyAll}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleExport}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export TXT</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Clear all saved team names?')) {
                  onClearAll();
                }
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedConcepts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-300">No saved names yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the bookmark icon on any generated team name to save it to your roster.
                </p>
              </div>
            </div>
          ) : (
            savedConcepts.map((item) => {
              const meta = VIBE_METADATA[item.vibe];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold border"
                          style={{
                            backgroundColor: `${meta.accentColor}15`,
                            borderColor: `${meta.accentColor}30`,
                            color: meta.accentColor
                          }}
                        >
                          {item.vibe}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {item.acronym}
                        </span>
                      </div>
                      <div className="font-bold text-white text-base">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 italic line-clamp-1">
                        "{item.tagline}"
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopySingle(item.name, item.id)}
                        title="Copy name"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-lime-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onRemoveSaved(item.id)}
                        title="Remove"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">{item.patternUsed}</span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onInspectIdentity(item);
                      }}
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Preview Identity</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Stored in browser local storage</span>
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

