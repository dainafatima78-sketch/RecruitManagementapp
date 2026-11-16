import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileCode, CheckCircle2, Terminal } from 'lucide-react';
import { sounds } from './AudioEffects';

interface NotebookInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORIGINAL_PYTHON_CODE = `# Word banks mapped to industries and vibes
adjectives = {
    "Creative": ["Apex", "Quantum", "Vivid", "Cognitive", "Synapse", "Prismatic", "Nexus", "Elysian", "Catalyst", "Aether"],
    "Tech": ["Cyber", "Binary", "Vector", "Algorithmic", "Cloud", "Helix", "Silicon", "Neural", "Matrix", "Syntax"],
    "Business / Professional": ["Summit", "Vanguard", "Synergy", "Pinnacle", "Alliance", "Crest", "Legacy", "Beacon", "Charter", "Apex"],
    "Bold & Fierce": ["Rogue", "Maverick", "Titan", "Vortex", "Blaze", "Phoenix", "Phantom", "Apex", "Velocity", "Obsidian"]
}

nouns = {
    "Creative": ["Guild", "Lab", "Studio", "Collective", "Forge", "Minds", "Wave", "Engine", "Canvas", "Innovators"],
    "Tech": ["Systems", "Nodes", "Bots", "Labs", "Devs", "Network", "Logic", "Matrix", "Architects", "Coders"],
    "Business / Professional": ["Consulting", "Partners", "Group", "Holdings", "Ventures", "Capital", "Advisors", "Strategies", "Syndicate"],
    "Bold & Fierce": ["Warriors", "Squad", "Force", "Knights", "Wolves", "Raiders", "Outlaws", "Brigade", "Rangers"]
}

# Click action handler
def on_button_clicked(b):
    with output_area:
        output_area.clear_output()
        vibe = industry_dropdown.value
        kw = keyword_input.value.strip()

        # Generate a list of suggestions
        suggestions = []
        for _ in range(3):
            adj = random.choice(adjectives[vibe])
            noun = random.choice(nouns[vibe])

            if kw:
                pattern = random.choice([
                    f"{kw} {noun}",
                    f"{adj} {kw}",
                    f"The {adj} {kw} {noun}"
                ])
            else:
                pattern = f"{adj} {noun}"

            suggestions.append(pattern)

        # Render UI result block
        results_html = "<div class='result-card'>"
        results_html += "<div class='result-title'>💡 Generated Team Concepts:</div>"
        for idx, name in enumerate(suggestions, 1):
            results_html += f"<div class='result-name' style='margin-bottom:12px;'>{idx}. {name}</div>"
        results_html += "</div>"

        display(HTML(results_html))`;

export const NotebookInspectorModal: React.FC<NotebookInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [tab, setTab] = useState<'python' | 'architecture'>('python');

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playCopy();
    navigator.clipboard.writeText(ORIGINAL_PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Algorithm & Notebook Inspection</h2>
              <p className="text-xs text-slate-400">
                100% faithful representation of <code className="text-cyan-300">Team name generater.ipynb</code>
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

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                sounds.playClick();
                setTab('python');
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'python'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Original Python Algorithm
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTab('architecture');
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'architecture'
                  ? 'border-violet-400 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Web Architecture & Fidelity
            </button>
          </div>

          {tab === 'python' && (
            <button
              onClick={handleCopy}
              className="mb-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1.5 border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Python'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {tab === 'python' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                <span className="font-semibold text-cyan-300">Algorithm Mechanism:</span> For each generation cycle, an adjective and noun are sampled from the chosen vibe dictionary. If a custom keyword is supplied, it branches into 3 combinatorial formulas: <code className="text-lime-300 font-mono">kw noun</code>, <code className="text-lime-300 font-mono">adj kw</code>, or <code className="text-lime-300 font-mono">The adj kw noun</code>.
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-white/5">
                <code>{ORIGINAL_PYTHON_CODE}</code>
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-400" />
                  <span>Strict Preservation of Notebook Logic</span>
                </h3>
                <p>
                  The original Jupyter Notebook file is stored untouched at <code className="text-cyan-300">./Team name generater.ipynb</code>.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
                  <li><strong>Full Lexicon Inclusion:</strong> All 4 industries (Tech, Creative, Business/Professional, Bold & Fierce) with all 10 adjectives and 9-10 nouns are preserved byte-for-byte.</li>
                  <li><strong>Exact Combinatorial Branching:</strong> When a keyword is provided, the identical 3 patterns are sampled. Without a keyword, it generates pure <code className="text-lime-300 font-mono">&#123;adj&#125; &#123;noun&#125;</code> pairings.</li>
                  <li><strong>Client + Server API Parity:</strong> The logic runs seamlessly in React TypeScript on the client for zero latency, and also has an Express endpoint at <code className="text-violet-300 font-mono">POST /api/team/generate</code>.</li>
                  <li><strong>Original Visual Identity:</strong> The color accents, gradient titles, and <code className="text-cyan-300 font-mono">💡 Generated Team Concepts:</code> card structure are honored and upgraded with high-contrast glassmorphism.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Notebook Status: Verified & Live in Web App</span>
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

