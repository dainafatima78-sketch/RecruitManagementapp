import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquareText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Edit2,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Job, Candidate, InterviewQuestion, QuestionCategory, QuestionDifficulty } from '../types/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const InterviewGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Candidate Selection State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    searchParams.get('candidateId') || ''
  );

  // Form Parameters
  const [targetRole, setTargetRole] = useState<string>(searchParams.get('role') || '');
  const [relatedJobId, setRelatedJobId] = useState<string>(searchParams.get('jobId') || '');
  const [interviewType, setInterviewType] = useState<QuestionCategory>('Technical');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [instructions, setInstructions] = useState<string>(searchParams.get('instructions') || '');

  // Generation state
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [editText, setEditText] = useState('');
  const [editCriteria, setEditCriteria] = useState('');

  // Expanded criteria map
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setIsLoadingData(true);
        const [jobsData, candidatesData] = await Promise.all([
          api.getJobs(),
          api.getCandidates()
        ]);
        if (isMounted) {
          setJobs(jobsData);
          setCandidates(candidatesData);

          // Check if candidateId or candidate name was passed in URL
          const urlCandId = searchParams.get('candidateId');
          const urlCandName = searchParams.get('candidate');
          if (urlCandId && candidatesData.some(c => c.id === urlCandId)) {
            handleSelectCandidate(urlCandId, candidatesData);
          } else if (urlCandName) {
            const found = candidatesData.find(c =>
              c.name.toLowerCase().includes(urlCandName.toLowerCase())
            );
            if (found) {
              handleSelectCandidate(found.id, candidatesData);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load initial interview generator data:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  const handleSelectCandidate = (candidateId: string, candidateList = candidates) => {
    setSelectedCandidateId(candidateId);
    if (!candidateId) return;

    const cand = candidateList.find(c => c.id === candidateId);
    if (cand) {
      const candidateRole =
        cand.associatedJobTitle && cand.associatedJobTitle !== 'Unassigned'
          ? cand.associatedJobTitle
          : cand.currentRole;
      setTargetRole(candidateRole);

      // Pre-select related job if associated
      if (cand.associatedJobId) {
        setRelatedJobId(cand.associatedJobId);
      }
    }
  };

  const handleSelectJob = (jobId: string) => {
    setRelatedJobId(jobId);
    if (jobId && !selectedCandidateId && !targetRole.trim()) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setTargetRole(job.title);
      }
    }
  };

  const getEffectiveRole = () => {
    if (targetRole.trim()) {
      return targetRole.trim();
    }
    if (selectedCandidate) {
      return (
        selectedCandidate.currentRole ||
        (selectedCandidate.associatedJobTitle !== 'Unassigned' ? selectedCandidate.associatedJobTitle : '') ||
        'Software Engineer'
      );
    }
    const relatedJob = jobs.find(j => j.id === relatedJobId);
    if (relatedJob) {
      return relatedJob.title;
    }
    return 'Software Engineer';
  };

  const handleGenerate = async () => {
    const role = getEffectiveRole();
    if (!role) {
      addToast('warning', 'Role Required', 'Please enter a target role.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateInterviewQuestions({
        role,
        candidateId: selectedCandidateId || undefined,
        relatedJobId: relatedJobId || undefined,
        interviewType,
        difficulty,
        count: questionCount,
        additionalInstructions: instructions.trim() || undefined
      });

      setQuestions(res.questions);
      addToast(
        'success',
        'Questions Ready',
        selectedCandidate
          ? `Generated ${res.questions.length} personalized interview questions for ${selectedCandidate.name}.`
          : `Generated ${res.questions.length} structured interview questions.`
      );
    } catch (err: any) {
      addToast('error', 'Generation Error', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingle = (q: InterviewQuestion) => {
    const textToCopy = `Question ${q.number}: ${q.text}\nCategory: ${q.category} | Difficulty: ${q.difficulty}\nEvaluation Criteria: ${q.evaluationCriteria}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(q.id);
    addToast('info', 'Question Copied', 'Question copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (questions.length === 0) return;
    const allText = questions
      .map(q => `${q.number}. ${q.text}\n   Category: ${q.category} (${q.difficulty})\n   Evaluation Guide: ${q.evaluationCriteria}\n`)
      .join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    addToast('success', 'All Copied', `Copied ${questions.length} questions to clipboard.`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportText = () => {
    if (questions.length === 0) return;
    const role = getEffectiveRole();
    const candidateHeader = selectedCandidate ? `Candidate: ${selectedCandidate.name}\n` : '';
    const content = `RecruitAI Interview Guide\n${candidateHeader}Target Role: ${role}\nType: ${interviewType} | Difficulty: ${difficulty}\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
      questions
        .map(q => `QUESTION ${q.number}:\n${q.text}\n\nCategory: ${q.category}\nDifficulty: ${q.difficulty}\nWhat to look for:\n${q.evaluationCriteria}\n----------------------------------------\n`)
        .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${role.replace(/\s+/g, '_')}_Interview_Questions.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Exported', 'Interview questions downloaded as text file.');
  };

  const handleOpenEdit = (q: InterviewQuestion) => {
    setEditingQuestion(q);
    setEditText(q.text);
    setEditCriteria(q.evaluationCriteria);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    try {
      const updated = await api.updateInterviewQuestion(editingQuestion.id, {
        text: editText,
        evaluationCriteria: editCriteria
      });
      setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)));
      addToast('success', 'Question Updated', 'Question modifications saved.');
      setEditingQuestion(null);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const toggleCriteria = (id: string) => {
    setExpandedCriteria(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202638] tracking-tight">AI Interview Generator</h2>
        <p className="text-xs sm:text-sm text-[#697386]">
          Generate structured interview questions with evaluation criteria tailored to candidate profile, seniority, and interview format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Generation Parameters */}
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
            <Sparkles className="w-4 h-4 text-[#3978F6]" />
            <h3 className="text-sm font-bold text-[#202638]">Generator Parameters</h3>
          </div>

          {/* 1. Candidate Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#202638] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#3978F6]" />
                Select Candidate
              </span>
              {candidates.length > 0 && (
                <span className="text-[10px] text-[#697386] font-normal lowercase">
                  {candidates.length} saved
                </span>
              )}
            </label>

            {isLoadingData ? (
              <div className="h-9 w-full bg-slate-100 rounded-lg animate-pulse" />
            ) : candidates.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-dashed border-[#E3E8F0] bg-[#F8FAFD] text-center space-y-1">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E3E8F0] flex items-center justify-center text-[#697386] mx-auto shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#202638]">No candidates available</p>
                <p className="text-[11px] text-[#697386] leading-relaxed">
                  Upload candidate resumes in Candidates to generate tailored questions, or use manual role selection below.
                </p>
              </div>
            ) : (
              <Select
                name="candidateSelection"
                value={selectedCandidateId}
                onChange={e => handleSelectCandidate(e.target.value)}
                options={[
                  { value: '', label: '-- None (Manual Role Specification) --' },
                  ...candidates.map(c => ({
                    value: c.id,
                    label: `${c.name} — ${c.currentRole} (${c.experienceYears} yrs)`
                  }))
                ]}
              />
            )}

            {/* Selected Candidate Details Card */}
            {selectedCandidate && (
              <div className="p-3.5 rounded-xl border border-[#3978F6]/25 bg-[#EAF1FF]/40 space-y-2.5 mt-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#3978F6] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                      {selectedCandidate.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202638] truncate flex items-center gap-1.5">
                        {selectedCandidate.name}
                        <UserCheck className="w-3.5 h-3.5 text-[#17845D]" />
                      </p>
                      <p className="text-[11px] text-[#697386] truncate">
                        {selectedCandidate.currentRole} · {selectedCandidate.experienceYears} yrs experience
                      </p>
                    </div>
                  </div>
                  {selectedCandidate.matchScore > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-[#17845D] border border-emerald-200 shrink-0">
                      {selectedCandidate.matchScore}% Match
                    </span>
                  )}
                </div>

                {selectedCandidate.associatedJobTitle && selectedCandidate.associatedJobTitle !== 'Unassigned' && (
                  <p className="text-[11px] text-slate-700 font-medium">
                    Target Role: <strong className="text-[#202638]">{selectedCandidate.associatedJobTitle}</strong>
                  </p>
                )}

                {selectedCandidate.keySkills && selectedCandidate.keySkills.length > 0 && (
                  <div className="pt-2 border-t border-[#3978F6]/15 flex flex-wrap gap-1">
                    {selectedCandidate.keySkills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white text-[#202638] border border-[#3978F6]/20 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedCandidate.keySkills.length > 4 && (
                      <span className="text-[10px] text-[#697386] self-center">
                        +{selectedCandidate.keySkills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Select
            label="Related Job Requisition (Optional)"
            options={[
              { value: '', label: 'None / General Practice' },
              ...jobs.map(j => ({ value: j.id, label: `${j.title} (${j.department})` }))
            ]}
            value={relatedJobId}
            onChange={e => handleSelectJob(e.target.value)}
            helperText="Connects questions directly to requisition requirements."
          />

          <Select
            label="Interview Type"
            options={[
              { value: 'Technical', label: 'Technical' },
              { value: 'Behavioral', label: 'Behavioral' },
              { value: 'Situational', label: 'Situational' },
              { value: 'HR', label: 'HR & Cultural Fit' },
              { value: 'Role-specific', label: 'Role-specific' },
              { value: 'General', label: 'General Preliminary' }
            ]}
            value={interviewType}
            onChange={e => setInterviewType(e.target.value as QuestionCategory)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Difficulty"
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' }
              ]}
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as QuestionDifficulty)}
            />

            <Select
              label="Questions"
              options={[
                { value: '5', label: '5 Questions' },
                { value: '8', label: '8 Questions' },
                { value: '10', label: '10 Questions' },
                { value: '12', label: '12 Questions' }
              ]}
              value={String(questionCount)}
              onChange={e => setQuestionCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202638] mb-1.5">
              Additional Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Focus on modern React 19 features, accessibility standards, and handling cross-functional pushback..."
              className="block w-full rounded-lg border border-[#E3E8F0] bg-white p-2.5 text-xs text-[#202638] placeholder:text-[#697386]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6]"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full mt-2"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={handleGenerate}
            isLoading={isGenerating}
          >
            {isGenerating
              ? 'Synthesizing Questions...'
              : selectedCandidate
              ? `Generate Questions for ${selectedCandidate.name.split(' ')[0]}`
              : 'Generate Questions'}
          </Button>
        </div>

        {/* Right Area: Generated Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-[#3978F6]" />
              <span className="text-sm font-bold text-[#202638]">
                {questions.length > 0
                  ? `${questions.length} Generated Questions`
                  : 'Interview Question Workspace'}
              </span>
              {questions.length > 0 && (
                <span className="text-xs text-[#697386]">
                  · {selectedCandidate ? selectedCandidate.name : getEffectiveRole()} ({difficulty})
                </span>
              )}
            </div>

            {questions.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedAll ? <Check className="w-3.5 h-3.5 text-[#17845D]" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyAll}
                >
                  {copiedAll ? 'Copied' : 'Copy All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportText}
                >
                  Export .txt
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {questions.length === 0 && !isGenerating && (
            <div className="bg-white rounded-xl border border-[#E3E8F0] p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#3978F6] mx-auto mb-3 shadow-2xs">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#202638] mb-1">
                Your generated questions will appear here.
              </h4>
              <p className="text-xs text-[#697386] max-w-sm mx-auto mb-4 leading-relaxed">
                Select a candidate or configure parameters on the left to generate structured interview questions with evaluation criteria.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleGenerate}
              >
                Generate First Questions
              </Button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isGenerating && (
            <div className="space-y-3">
              {Array.from({ length: questionCount }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E3E8F0] p-5 space-y-3 animate-pulse shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-8 w-40 bg-slate-100 rounded mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Questions List */}
          {!isGenerating && questions.length > 0 && (
            <div className="space-y-3">
              {questions.map(q => {
                const isExpanded = !!expandedCriteria[q.id];
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3 transition-all hover:border-[#3978F6]/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#EAF1FF] text-[#3978F6] font-mono tabular-nums font-bold text-xs flex items-center justify-center shrink-0">
                          {q.number}
                        </span>
                        <Badge variant="cobalt" size="sm">
                          {q.category}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {q.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopySingle(q)}
                          className="p-1.5 text-[#697386] hover:text-[#202638] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Copy question"
                        >
                          {copiedId === q.id ? (
                            <Check className="w-3.5 h-3.5 text-[#17845D]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 text-[#697386] hover:text-[#202638] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit question text"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-[#202638] leading-relaxed">
                      {q.text}
                    </p>

                    {/* Collapsible Evaluation Criteria */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => toggleCriteria(q.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#3978F6] hover:text-[#2865DF] transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#17845D]" />
                        <span>Evaluation Criteria & Good Response Indicators</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] text-xs text-[#202638] leading-relaxed">
                          <p className="font-semibold text-[#697386] text-[10px] uppercase tracking-wider mb-1">
                            Interviewer Guide:
                          </p>
                          {q.evaluationCriteria}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title={`Edit Question #${editingQuestion.number}`}
          subtitle="Customize question phrasing or evaluation criteria"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button variant="outline" size="sm" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202638] mb-1.5">
                Question Text
              </label>
              <textarea
                rows={3}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full rounded-lg border border-[#E3E8F0] p-2.5 text-xs text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202638] mb-1.5">
                Evaluation Criteria
              </label>
              <textarea
                rows={4}
                value={editCriteria}
                onChange={e => setEditCriteria(e.target.value)}
                className="w-full rounded-lg border border-[#E3E8F0] p-2.5 text-xs text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6]"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
