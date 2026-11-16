import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MatchAnalysis } from '../../types/client';

interface MatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: MatchAnalysis | null;
  onGenerateQuestionsForCandidate?: (role: string, candidateName: string) => void;
}

export const MatchAnalysisModal: React.FC<MatchAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onGenerateQuestionsForCandidate
}) => {
  if (!analysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#17845D] bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-[#3978F6] bg-blue-50 border-blue-200';
    return 'text-[#B7791F] bg-amber-50 border-amber-200';
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'Met' || verdict === 'Exceeded') {
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#17845D]/10 text-[#17845D]">{verdict}</span>;
    }
    if (verdict === 'Partially Met' || verdict === 'Alternative Match') {
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#B7791F]/10 text-[#B7791F]">{verdict}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#C94353]/10 text-[#C94353]">{verdict}</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Match Analysis: ${analysis.candidateName}`}
      subtitle={`Evaluated against: ${analysis.jobTitle}`}
      maxWidth="3xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            icon={<MessageSquare className="w-4 h-4 text-[#3978F6]" />}
            onClick={() => {
              onClose();
              onGenerateQuestionsForCandidate?.(analysis.jobTitle, analysis.candidateName);
            }}
          >
            Generate Follow-up Interview Questions
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Analysis
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Overall Score Header */}
        <div className="p-5 rounded-xl border border-[#E3E8F0] bg-[#F8FAFD] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#3978F6]" />
              <h3 className="text-base font-bold text-[#202638]">Overall Match Score</h3>
            </div>
            <p className="text-xs text-[#697386] mt-1 max-w-md">
              Synthesized from direct skill verification, verified years of professional experience, and academic accreditation alignment.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center shadow-xs ${getScoreColor(analysis.overallScore)}`}>
              <span className="text-2xl font-bold font-mono tabular-nums leading-none">
                {analysis.overallScore}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-80">
                Fit Index
              </span>
            </div>
          </div>
        </div>

        {/* Subscore Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-[#E3E8F0] bg-white">
            <span className="text-[11px] font-semibold text-[#697386] block">Skills Match</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-[#202638]">
                {analysis.skillsScore}%
              </span>
              <span className="text-xs text-[#17845D] font-medium">Weighted 50%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-[#3978F6] rounded-full" style={{ width: `${analysis.skillsScore}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E3E8F0] bg-white">
            <span className="text-[11px] font-semibold text-[#697386] block">Experience Alignment</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-[#202638]">
                {analysis.experienceScore}%
              </span>
              <span className="text-xs text-[#17845D] font-medium">Weighted 35%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-[#17845D] rounded-full" style={{ width: `${analysis.experienceScore}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E3E8F0] bg-white">
            <span className="text-[11px] font-semibold text-[#697386] block">Education Alignment</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-[#202638]">
                {analysis.educationScore}%
              </span>
              <span className="text-xs text-[#17845D] font-medium">Weighted 15%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-[#B7791F] rounded-full" style={{ width: `${analysis.educationScore}%` }} />
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#17845D]" />
            <span>Key Candidate Strengths</span>
          </h4>
          <div className="space-y-1.5">
            {analysis.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40 text-xs text-[#202638]">
                <span className="text-[#17845D] font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#E3E8F0] bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17845D] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matching Evidenced Skills ({analysis.matchingSkills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchingSkills.map(s => (
                <span key={s} className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-[#17845D] border border-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E3E8F0] bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B7791F] mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Missing or Unverified Skills ({analysis.missingSkills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingSkills.length > 0 ? (
                analysis.missingSkills.map(s => (
                  <span key={s} className="px-2 py-1 text-xs rounded-md bg-amber-50 text-[#B7791F] border border-amber-200">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#697386]">No critical skill gaps identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Experience and Education Comparisons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#E3E8F0] bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[#697386] flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#3978F6]" />
                Experience Comparison
              </span>
              {getVerdictBadge(analysis.experienceComparison.verdict)}
            </div>
            <div className="pt-1 space-y-1">
              <p className="text-[#697386]">
                Required: <strong className="text-[#202638] font-mono tabular-nums">{analysis.experienceComparison.required}</strong>
              </p>
              <p className="text-[#697386]">
                Evidenced: <strong className="text-[#202638] font-mono tabular-nums">{analysis.experienceComparison.candidate}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E3E8F0] bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[#697386] flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#3978F6]" />
                Education Comparison
              </span>
              {getVerdictBadge(analysis.educationComparison.verdict)}
            </div>
            <div className="pt-1 space-y-1">
              <p className="text-[#697386]">
                Required: <strong className="text-[#202638]">{analysis.educationComparison.required}</strong>
              </p>
              <p className="text-[#697386]">
                Candidate: <strong className="text-[#202638]">{analysis.educationComparison.candidate}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Interview Questions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#3978F6]" />
            <span>Suggested Interview Follow-up Questions</span>
          </h4>
          <div className="space-y-2">
            {analysis.suggestedQuestions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-[#E3E8F0] bg-white text-xs text-[#202638] flex items-start gap-2.5">
                <span className="font-mono tabular-nums font-bold text-[#3978F6] shrink-0">
                  {idx + 1}.
                </span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
