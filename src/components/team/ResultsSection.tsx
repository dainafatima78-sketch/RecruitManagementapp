import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  Share2,
  Download,
  Eye,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import {
  GeneratedTeamConcept,
  VIBE_METADATA,
  VibeType
} from '../../services/teamGenerator';
import { sounds } from './AudioEffects';

interface ResultsSectionProps {
  concepts: GeneratedTeamConcept[];
  savedIds: Set<string>;
  onToggleSave: (concept: GeneratedTeamConcept) => void;
  onRerollSingle: (index: number) => void;
  onRerollAll: () => void;
  onInspectIdentity: (concept: GeneratedTeamConcept) => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  concepts,
  savedIds,
  onToggleSave,
  onRerollSingle,
  onRerollAll,
  onInspectIdentity
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [filterVibe, setFilterVibe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (concepts.length === 0) {
    return null;
  }

  const handleCopySingle = (name: string, id: string) => {
    sounds.playCopy();
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    sounds.playCopy();
    const listText = concepts.map((c, idx) => `${idx + 1}. ${c.name}`).join('\n');
    navigator.clipboard.writeText(listText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportTxt = () => {
    sounds.playClick();
    const content = concepts
      .map(
        (c, idx) =>
          `[#${idx + 1}] ${c.name}\n` +
          `Vibe: ${c.vibe}\n` +
          `Formula: ${c.patternUsed} (${c.adjective || ''} + ${c.noun || ''})\n` +
          `Acronym: ${c.acronym}\n` +
          `Motto: "${c.tagline}"\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team-names-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    sounds.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(concepts, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `team-concepts-${Date.now()}.json`;
    link.click();
  };

  // Filter items
  const filteredConcepts = concepts.filter((c) => {
    const matchesVibe = filterVibe === 'all' || c.vibe === filterVibe;
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.noun.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVibe && matchesSearch;
  });

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-10">
      {/* Signature Result Container inspired directly by Notebook */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-l-cyan-400 border-white/10 shadow-2xl relative">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            {/* Direct tribute to Notebook class `result-title` */}
            <div className="text-xs uppercase tracking-[2px] font-bold text-cyan-400 mb-1 flex items-center space-x-1.5">
              <span>💡</span>
              <span>Generated Team Concepts:</span>
            </div>
            <p className="text-sm text-slate-300">
              Showing <span className="font-semibold text-white">{filteredConcepts.length}</span> forged combinations
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onRerollAll}
              title="Regenerate all names"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reroll All</span>
            </button>

            <button
              onClick={handleCopyAll}
              title="Copy all names to clipboard"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-lime-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-violet-400" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportTxt}
              title="Download text file"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-lime-400" />
              <span>TXT</span>
            </button>

            <button
              onClick={handleExportJson}
              title="Download JSON export"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Sub-bar (if more than 3 names) */}
        {concepts.length > 3 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2">
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter names..."
                className="w-full glass-input px-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end">
              <span className="text-slate-400 text-[11px]">Filter Vibe:</span>
              <select
                value={filterVibe}
                onChange={(e) => {
                  sounds.playClick();
                  setFilterVibe(e.target.value);
                }}
                className="glass-input px-2.5 py-1 rounded-xl text-xs text-slate-200 bg-slate-900"
              >
                <option value="all">All Vibes</option>
                <option value="Tech">Tech</option>
                <option value="Creative">Creative</option>
                <option value="Business / Professional">Business</option>
                <option value="Bold & Fierce">Bold</option>
              </select>
            </div>
          </div>
        )}

        {/* Generated Cards Grid */}
        <div className="mt-6 space-y-3.5">
          {filteredConcepts.map((concept, index) => {
            const isSaved = savedIds.has(concept.id);
            const isCopied = copiedId === concept.id;
            const meta = VIBE_METADATA[concept.vibe];

            return (
              <div
                key={concept.id}
                className="group relative p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Number, Name, Formula & Details */}
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      {/* Numbering badge */}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-black">
                        {index + 1}
                      </span>

                      {/* Vibe badge */}
                      <span
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border"
                        style={{
                          backgroundColor: `${meta.accentColor}15`,
                          borderColor: `${meta.accentColor}40`,
                          color: meta.accentColor
                        }}
                      >
                        {concept.vibe}
                      </span>

                      {/* Acronym badge */}
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-white/10">
                        {concept.acronym}
                      </span>

                      {/* Formula pattern badge */}
                      <span className="text-[11px] font-mono text-slate-400">
                        {concept.keyword ? `Formula: ${concept.patternUsed}` : `{Adjective} + {Noun}`}
                      </span>
                    </div>

                    {/* Direct tribute to Notebook class `result-name` */}
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                      {concept.name}
                    </div>

                    {/* Team Slogan / Motto preview */}
                    <p className="text-xs text-slate-400 mt-1 italic flex items-center space-x-1">
                      <span className="text-slate-600">"</span>
                      <span>{concept.tagline}</span>
                      <span className="text-slate-600">"</span>
                    </p>
                  </div>

                  {/* Right Column: Interactive Quick Actions */}
                  <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Copy Name */}
                    <button
                      onClick={() => handleCopySingle(concept.name, concept.id)}
                      title="Copy to clipboard"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-lime-400 animate-scale" />
                      ) : (
                        <Copy className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>

                    {/* Bookmark / Favorite */}
                    <button
                      onClick={() => {
                        sounds.playFavorite();
                        onToggleSave(concept);
                      }}
                      title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-lime-950/60 border-lime-400/50 text-lime-300'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-lime-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Reroll this single item */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRerollSingle(index);
                      }}
                      title="Reroll this concept"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Team Identity Card Preview */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onInspectIdentity(concept);
                      }}
                      title="Inspect Team Identity & Badge"
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-500/30 hover:from-violet-600/50 hover:to-cyan-500/50 border border-cyan-400/30 text-cyan-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Preview Identity</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

