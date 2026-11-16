import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Bookmark,
  Code2,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { sounds } from './AudioEffects';

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenWordBanks: () => void;
  onOpenNotebook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenWordBanks,
  onOpenNotebook
}) => {
  const [muted, setMuted] = useState(sounds.getMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setMuted(next);
    if (!next) {
      sounds.playClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300">
            <div className="w-full h-full bg-[#0B1020] rounded-[11px] flex items-center justify-center">
              <span className="text-xl transform group-hover:scale-110 transition-transform">⚡</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-white">
                TEAM NAME <span className="text-cyan-400">FORGE</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full">
                v2.0 Web
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Combinatorial Team Identity Generator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Sounds Muted' : 'Sounds Active'}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl transition-all flex items-center space-x-1.5"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden md:inline">{muted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Word Banks Explorer */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenWordBanks();
            }}
            className="px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl transition-all flex items-center space-x-1.5 hover:border-violet-500/40"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">Word Banks</span>
          </button>

          {/* Notebook Algorithm Viewer */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenNotebook();
            }}
            className="px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl transition-all flex items-center space-x-1.5 hover:border-cyan-500/40"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Notebook Code</span>
          </button>

          {/* Saved Favorites Drawer Trigger */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSaved();
            }}
            className="relative px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600/30 to-cyan-500/30 hover:from-violet-600/50 hover:to-cyan-500/50 border border-cyan-500/40 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm shadow-cyan-500/20"
          >
            <Bookmark className="w-4 h-4 text-lime-400" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-lime-400 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

