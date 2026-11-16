import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckSquare,
  Square,
  Eye,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { Job, Candidate, MatchAnalysis } from '../types/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { MatchAnalysisModal } from '../components/matching/MatchAnalysisModal';

export const MatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState<MatchAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [selectedAnalysis, setSelectedAnalysis] = useState<MatchAnalysis | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [jobsData, candsData, matchesData] = await Promise.all([
          api.getJobs(),
          api.getCandidates(),
          api.getMatches()
        ]);

        if (isMounted) {
          setJobs(jobsData);
          setCandidates(candsData);
          setMatchResults(matchesData);

          if (jobsData.length > 0) {
            setSelectedJobId(jobsData[0].id);
          }
        }
      } catch (err: any) {
        addToast('error', 'Failed to load matching data', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      const associated = candidates
        .filter(c => c.associatedJobId === selectedJobId)
        .map(c => c.id);
      setSelectedCandidateIds(associated.length > 0 ? associated : candidates.slice(0, 4).map(c => c.id));
    }
  }, [selectedJobId, candidates]);

  const activeJob = jobs.find(j => j.id === selectedJobId);

  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidateIds.length === candidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidates.map(c => c.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedCandidateIds([]);
  };

  const handleRunAnalysis = async () => {
    if (!selectedJobId) {
      addToast('warning', 'Select a Job', 'Please choose a job requisition to evaluate candidates against.');
      return;
    }
    if (selectedCandidateIds.length === 0) {
      addToast('warning', 'Select Candidates', 'Please select at least one candidate to analyze.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await api.analyzeMatching(selectedJobId, selectedCandidateIds);
      setMatchResults(prev => {
        const otherMatches = prev.filter(m => m.jobId !== selectedJobId || !selectedCandidateIds.includes(m.candidateId));
        return [...res.results, ...otherMatches];
      });

      addToast(
        'success',
        'Analysis Complete',
        `Evaluated ${res.count} candidates against "${res.jobTitle}".`
      );
    } catch (err: any) {
      addToast('error', 'Analysis Failed', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  let displayAnalyses = matchResults.filter(m => m.jobId === selectedJobId);

  if (sortBy === 'score') {
    displayAnalyses.sort((a, b) => b.overallScore - a.overallScore);
  } else {
    displayAnalyses.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202638] tracking-tight">AI Candidate Matching</h2>
          <p className="text-xs text-[#697386]">
            Compare candidate profiles against job requirements, calculate fit scores, and pinpoint skill gaps.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Select Target Job Requisition"
              options={
                jobs.length > 0
                  ? jobs.map(j => ({ value: j.id, label: `${j.title} (${j.department} · ${j.location})` }))
                  : [{ value: '', label: 'No job requisitions created yet' }]
              }
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              disabled={jobs.length === 0}
              helperText={
                jobs.length === 0
                  ? 'Create a job requisition first to analyze candidates.'
                  : activeJob
                  ? `Requirements: ${activeJob.requiredSkills.join(', ')} · Min Exp: ${activeJob.minExperience}`
                  : ''
              }
            />
          </div>

          <div className="flex flex-col justify-end space-y-1.5">
            <span className="text-xs font-semibold text-[#202638]">
              Candidate Selection ({selectedCandidateIds.length} Selected)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={candidates.length === 0}
              >
                {selectedCandidateIds.length === candidates.length && candidates.length > 0 ? 'Deselect All' : 'Select All Candidates'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedCandidateIds.length === 0}
              >
                Clear Selection
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
                disabled={selectedCandidateIds.length === 0 || !selectedJobId}
              >
                Analyze Matches
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E3E8F0]">
          <span className="text-[11px] font-semibold text-[#697386] uppercase tracking-wider block mb-2">
            Click candidates to toggle inclusion:
          </span>
          {candidates.length === 0 ? (
            <p className="text-xs text-[#697386] py-3">
              No candidates available. Upload candidate resumes first to begin matching.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {candidates.map(cand => {
                const isSelected = selectedCandidateIds.includes(cand.id);
                const isAssociated = cand.associatedJobId === selectedJobId;
                return (
                  <button
                    key={cand.id}
                    onClick={() => handleToggleCandidate(cand.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF1FF] border-[#3978F6] text-[#3978F6] shadow-2xs'
                        : 'bg-white border-[#E3E8F0] text-[#697386] hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 opacity-60" />}
                    <span>{cand.name}</span>
                    {isAssociated && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3978F6]" title="Applied to this role" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E8F0] shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 sm:px-5 sm:py-3.5 border-b border-[#E3E8F0] flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#202638] tracking-tight">
              Evaluation Results: {activeJob?.title || 'Selected Job'}
            </h3>
            <p className="text-[11px] text-[#697386]">
              {displayAnalyses.length} candidate assessments recorded
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#697386]">Sort by:</span>
            <button
              onClick={() => setSortBy('score')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                sortBy === 'score' ? 'bg-[#EAF1FF] text-[#3978F6]' : 'text-[#697386] hover:text-[#202638]'
              }`}
            >
              Match Score
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                sortBy === 'name' ? 'bg-[#EAF1FF] text-[#3978F6]' : 'text-[#697386] hover:text-[#202638]'
              }`}
            >
              Name
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading || isAnalyzing ? (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#3978F6]" />
                <p className="text-xs font-semibold text-[#202638]">
                  {isAnalyzing ? 'Running AI Candidate Evaluation & Requirement Extraction...' : 'Loading assessments...'}
                </p>
                <p className="text-[11px] text-[#697386]">Synthesizing qualifications, skill overlap, and experience metrics</p>
              </div>
            </div>
          ) : displayAnalyses.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-6 h-6 text-[#3978F6]" />}
              title="No match results available."
              description="Please select a real job and candidate before starting an analysis."
              actionLabel={jobs.length > 0 && candidates.length > 0 ? "Analyze Selected Candidates" : undefined}
              onAction={jobs.length > 0 && candidates.length > 0 ? handleRunAnalysis : undefined}
              className="py-14 border-0"
            />
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFD] border-b border-[#E3E8F0] text-[11px] font-semibold text-[#697386] uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-3 text-center">Overall Fit</th>
                  <th className="py-3 px-3">Matching Skills</th>
                  <th className="py-3 px-3">Missing / Unverified</th>
                  <th className="py-3 px-3">Experience</th>
                  <th className="py-3 px-3">Education</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F0] text-xs">
                {displayAnalyses.map(analysis => (
                  <tr key={analysis.id} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#202638]">
                      <span className="block text-sm">{analysis.candidateName}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block font-mono tabular-nums font-bold text-xs px-2.5 py-1 rounded-md border ${
                          analysis.overallScore >= 90
                            ? 'bg-emerald-50 text-[#17845D] border-emerald-200'
                            : analysis.overallScore >= 75
                            ? 'bg-blue-50 text-[#3978F6] border-blue-200'
                            : 'bg-amber-50 text-[#B7791F] border-amber-200'
                        }`}
                      >
                        {analysis.overallScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {analysis.matchingSkills.slice(0, 3).map(s => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-[#17845D] border border-emerald-200/60 truncate"
                          >
                            {s}
                          </span>
                        ))}
                        {analysis.matchingSkills.length > 3 && (
                          <span className="text-[10px] text-[#697386] self-center">
                            +{analysis.matchingSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {analysis.missingSkills.length > 0 ? (
                          analysis.missingSkills.slice(0, 2).map(s => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 text-[#B7791F] border border-amber-200/60 truncate"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#17845D] font-medium">None noted</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#202638]">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100">
                        {analysis.experienceComparison.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#202638]">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100">
                        {analysis.educationComparison.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#3978F6] bg-[#EAF1FF] hover:bg-[#d8e5ff] rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Analysis</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <MatchAnalysisModal
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        analysis={selectedAnalysis}
        onGenerateQuestionsForCandidate={(role, candidateName) => {
          navigate(`/interview-generator?role=${encodeURIComponent(role)}&instructions=${encodeURIComponent(`Focus on assessing ${candidateName} for open role.`)}`);
        }}
      />
    </div>
  );
};
