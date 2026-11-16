import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/team/Navbar';
import { HeroSection } from '../components/team/HeroSection';
import { GeneratorForm } from '../components/team/GeneratorForm';
import { ResultsSection } from '../components/team/ResultsSection';
import { WordBankModal } from '../components/team/WordBankModal';
import { NotebookInspectorModal } from '../components/team/NotebookInspectorModal';
import { SavedNamesDrawer } from '../components/team/SavedNamesDrawer';
import { IdentityPreviewModal } from '../components/team/IdentityPreviewModal';
import {
  generateTeamNames,
  GeneratedTeamConcept,
  VibeType,
  GenerationOptions
} from '../services/teamGenerator';
import { sounds } from '../components/team/AudioEffects';
import { Sparkles, Terminal, BookOpen, Shield, Code2, Heart } from 'lucide-react';

export const TeamForgePage: React.FC = () => {
  const [selectedVibe, setSelectedVibe] = useState<VibeType | 'All'>('Tech');
  const [keyword, setKeyword] = useState<string>('');
  const [concepts, setConcepts] = useState<GeneratedTeamConcept[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [totalGeneratedCount, setTotalGeneratedCount] = useState<number>(0);

  // Saved Favorites in LocalStorage
  const [savedConcepts, setSavedConcepts] = useState<GeneratedTeamConcept[]>(() => {
    try {
      const stored = localStorage.getItem('forge_saved_names');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isWordBankOpen, setIsWordBankOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [previewConcept, setPreviewConcept] = useState<GeneratedTeamConcept | null>(null);

  // Sync saved to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forge_saved_names', JSON.stringify(savedConcepts));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [savedConcepts]);

  // Generate initial names on page load (matches notebook default of 3 concepts)
  useEffect(() => {
    const initial = generateTeamNames({
      vibe: 'Tech',
      keyword: '',
      count: 3
    });
    setConcepts(initial);
    setTotalGeneratedCount(initial.length);
  }, []);

  const handleGenerate = (options: GenerationOptions) => {
    setIsGenerating(true);
    // Add realistic tactile generation feeling
    setTimeout(() => {
      const newConcepts = generateTeamNames(options);
      setConcepts(newConcepts);
      setTotalGeneratedCount((prev) => prev + newConcepts.length);
      setIsGenerating(false);
    }, 280);
  };

  const handleRerollSingle = (index: number) => {
    const target = concepts[index];
    if (!target) return;

    const singleNew = generateTeamNames({
      vibe: target.vibe,
      keyword: target.keyword || keyword,
      count: 1
    });

    if (singleNew.length > 0) {
      setConcepts((prev) => {
        const copy = [...prev];
        copy[index] = singleNew[0];
        return copy;
      });
      setTotalGeneratedCount((prev) => prev + 1);
    }
  };

  const handleRerollAll = () => {
    sounds.playGenerate();
    handleGenerate({
      vibe: selectedVibe,
      keyword,
      count: concepts.length || 3
    });
  };

  const handleToggleSave = (concept: GeneratedTeamConcept) => {
    setSavedConcepts((prev) => {
      const exists = prev.some((c) => c.id === concept.id || c.name.toLowerCase() === concept.name.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.id !== concept.id && c.name.toLowerCase() !== concept.name.toLowerCase());
      } else {
        return [concept, ...prev];
      }
    });
  };

  const handleRemoveSaved = (id: string) => {
    sounds.playClick();
    setSavedConcepts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAllSaved = () => {
    sounds.playClick();
    setSavedConcepts([]);
  };

  const savedIds = new Set(savedConcepts.map((c) => c.id));

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Bar */}
      <Navbar
        savedCount={savedConcepts.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenWordBanks={() => setIsWordBankOpen(true)}
        onOpenNotebook={() => setIsNotebookOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <HeroSection
          totalGenerated={totalGeneratedCount}
          onExploreVibe={(vibe) => {
            sounds.playClick();
            setSelectedVibe(vibe);
            handleGenerate({
              vibe,
              keyword,
              count: concepts.length || 3
            });
          }}
        />

        {/* Generator Form Card */}
        <GeneratorForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedVibe={selectedVibe}
          onVibeChange={setSelectedVibe}
          keyword={keyword}
          onKeywordChange={setKeyword}
        />

        {/* Results Section */}
        <ResultsSection
          concepts={concepts}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onRerollSingle={handleRerollSingle}
          onRerollAll={handleRerollAll}
          onInspectIdentity={(concept) => setPreviewConcept(concept)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0B1020]/90 backdrop-blur-md py-10 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0B1020] rounded-[7px] flex items-center justify-center text-sm font-bold">
                  ⚡
                </div>
              </div>
              <div>
                <span className="font-bold text-white text-sm">Team Name Forge</span>
                <p className="text-[11px] text-slate-400">
                  Transformed from <code className="text-cyan-300">Team name generater.ipynb</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsWordBankOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Word Banks
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsNotebookOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Algorithm Specs
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsSavedDrawerOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Saved Roster ({savedConcepts.length})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center md:text-right">
              High-contrast dark theme • 100% Client + Server Parity
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <WordBankModal
        isOpen={isWordBankOpen}
        onClose={() => setIsWordBankOpen(false)}
        onSelectKeyword={(word) => {
          setKeyword(word);
          handleGenerate({
            vibe: selectedVibe,
            keyword: word,
            count: concepts.length || 3
          });
        }}
      />

      <NotebookInspectorModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />

      <SavedNamesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedConcepts={savedConcepts}
        onRemoveSaved={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
        onInspectIdentity={(concept) => setPreviewConcept(concept)}
      />

      <IdentityPreviewModal
        concept={previewConcept}
        isOpen={!!previewConcept}
        onClose={() => setPreviewConcept(null)}
        isSaved={previewConcept ? savedIds.has(previewConcept.id) : false}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
};

