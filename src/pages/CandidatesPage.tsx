import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Upload,
  Search,
  Filter,
  Eye,
  Trash2,
  Sparkles,
  FileText,
  Mail,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { Candidate, Job, CandidateStatus, MatchAnalysis } from '../types/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Select } from '../components/common/Select';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { ResumeUploadModal } from '../components/candidates/ResumeUploadModal';
import { CandidateDetailModal } from '../components/candidates/CandidateDetailModal';
import { MatchAnalysisModal } from '../components/matching/MatchAnalysisModal';

export const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Automatic AI Matching Result Drawer / Modal
  const [selectedMatchAnalysis, setSelectedMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Check URL query param for ?upload=true
  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setIsUploadModalOpen(true);
      searchParams.delete('upload');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [candData, jobsData] = await Promise.all([
        api.getCandidates({
          search: searchTerm,
          jobId: jobFilter,
          status: statusFilter,
          experience: expFilter,
          sortBy
        }),
        api.getJobs()
      ]);
      setCandidates(candData);
      setJobs(jobsData);
    } catch (err: any) {
      addToast('error', 'Failed to fetch candidate data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, jobFilter, statusFilter, expFilter, sortBy]);

  const handleDeleteCandidateConfirm = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteCandidate(candidateToDelete.id);
      addToast('success', 'Candidate Removed', `${candidateToDelete.name} has been removed from the workspace.`);
      setCandidateToDelete(null);
      loadData();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Immediate AI matching result handler after resume upload
  const handleUploadSuccess = (candidate: Candidate, matchAnalysis?: MatchAnalysis) => {
    loadData();
    if (matchAnalysis) {
      setSelectedMatchAnalysis(matchAnalysis);
      setIsMatchModalOpen(true);
    }
  };

  const handleOpenCandidateMatch = async (candidate: Candidate) => {
    try {
      const matches = await api.getMatches(candidate.associatedJobId);
      const match = matches.find(m => m.candidateId === candidate.id);
      if (match) {
        setSelectedMatchAnalysis(match);
        setIsMatchModalOpen(true);
      } else {
        navigate(`/matching?candidateId=${candidate.id}`);
      }
    } catch {
      navigate(`/matching?candidateId=${candidate.id}`);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(candidates.length / itemsPerPage);
  const paginatedCandidates = candidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filterJobOptions = [
    { value: 'All', label: 'All Jobs' },
    ...jobs.map(j => ({ value: j.id, label: j.title }))
  ];

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'New', label: 'New' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Shortlisted', label: 'Shortlisted' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const expOptions = [
    { value: 'All', label: 'All Experience' },
    { value: '0-2', label: '0 - 2 Years' },
    { value: '3-5', label: '3 - 5 Years' },
    { value: '5+', label: '5+ Years' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Recently Added' },
    { value: 'name', label: 'Candidate Name' },
    { value: 'score', label: 'Match Score (High-Low)' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202638] tracking-tight">Candidate Management</h2>
          <p className="text-xs sm:text-sm text-[#697386]">
            Review candidate qualifications, parse uploaded resumes, and track recruitment stages.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, role, skill..."
            />
          </div>
          <div>
            <Select
              name="jobFilter"
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={filterJobOptions}
            />
          </div>
          <div>
            <Select
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />
          </div>
          <div>
            <Select
              name="expFilter"
              value={expFilter}
              onChange={(e) => {
                setExpFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={expOptions}
            />
          </div>
          <div>
            <Select
              name="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchTerm || jobFilter !== 'All' || statusFilter !== 'All' || expFilter !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-[#697386]">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="bg-[#EAF1FF] text-[#3978F6] px-2 py-0.5 rounded-md font-medium">
                Keyword: "{searchTerm}"
              </span>
            )}
            {jobFilter !== 'All' && (
              <span className="bg-slate-100 text-[#202638] px-2 py-0.5 rounded-md">
                Job: {jobs.find(j => j.id === jobFilter)?.title || jobFilter}
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="bg-slate-100 text-[#202638] px-2 py-0.5 rounded-md">
                Status: {statusFilter}
              </span>
            )}
            {expFilter !== 'All' && (
              <span className="bg-slate-100 text-[#202638] px-2 py-0.5 rounded-md">
                Exp: {expFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setJobFilter('All');
                setStatusFilter('All');
                setExpFilter('All');
              }}
              className="text-[#C94353] hover:underline ml-auto font-medium cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Candidates Table Card */}
      <div className="bg-white rounded-xl border border-[#E3E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#E3E8F0] bg-[#F8FAFD] text-[#697386] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-3">Associated Job</th>
                  <th className="py-3.5 px-3">Key Skills</th>
                  <th className="py-3.5 px-3">Experience</th>
                  <th className="py-3.5 px-3 text-center">AI Match</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-3 text-right">Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F0]">
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#697386] shadow-2xs">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#202638]">No candidates yet.</p>
                          <p className="text-xs text-[#697386] mt-0.5">
                            {searchTerm || jobFilter !== 'All' || statusFilter !== 'All' || expFilter !== 'All'
                              ? 'No candidates match your search filters.'
                              : 'Upload candidate resumes to start managing your talent pipeline.'}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Upload className="w-4 h-4" />}
                          onClick={() => setIsUploadModalOpen(true)}
                        >
                          Upload Resume
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map(cand => (
                    <tr key={cand.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#202638]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EAF1FF] text-[#3978F6] font-bold text-xs flex items-center justify-center shrink-0">
                            {cand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold truncate max-w-[180px]" title={cand.name}>
                              {cand.name}
                            </span>
                            <span className="text-[11px] text-[#697386] font-normal truncate block max-w-[180px]">
                              {cand.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#202638]">
                        <span className="truncate block max-w-[160px]" title={cand.associatedJobTitle}>
                          {cand.associatedJobTitle || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {cand.keySkills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-[#202638] border border-slate-200/60 truncate"
                            >
                              {skill}
                            </span>
                          ))}
                          {cand.keySkills.length > 3 && (
                            <span className="text-[10px] text-[#697386] self-center">
                              +{cand.keySkills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#697386] font-mono tabular-nums">
                        {cand.experienceYears} yrs
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {cand.matchScore > 0 ? (
                          <button
                            onClick={() => handleOpenCandidateMatch(cand)}
                            title="Click to view full AI Match Breakdown"
                            className={`inline-flex items-center gap-1 font-mono tabular-nums font-bold text-xs px-2 py-0.5 rounded transition-transform hover:scale-105 cursor-pointer ${
                              cand.matchScore >= 90
                                ? 'bg-emerald-50 text-[#17845D] border border-emerald-200'
                                : cand.matchScore >= 75
                                ? 'bg-blue-50 text-[#3978F6] border border-blue-200'
                                : 'bg-amber-50 text-[#B7791F] border border-amber-200'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{cand.matchScore}%</span>
                          </button>
                        ) : (
                          <span className="text-[#697386] text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={getStatusBadgeVariant(cand.status)} size="sm">
                          {cand.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right text-[#697386] font-mono tabular-nums">
                        {cand.dateAdded}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => setCandidateToDelete(cand)}
                            className="p-1.5 text-[#697386] hover:text-[#C94353] hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Remove candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={candidates.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Candidate Profile Detail Modal */}
      <CandidateDetailModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onStatusUpdated={loadData}
      />

      {/* Resume Upload Modal with Auto AI Matching */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        jobs={jobs}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Automatic & On-Demand AI Match Analysis Modal */}
      <MatchAnalysisModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        analysis={selectedMatchAnalysis}
        onGenerateQuestionsForCandidate={(role, candidateName) => {
          setIsMatchModalOpen(false);
          navigate(`/interview-generator?role=${encodeURIComponent(role)}&instructions=${encodeURIComponent(`Candidate: ${candidateName}`)}`);
        }}
      />

      {/* Confirm Delete Candidate Dialog */}
      <ConfirmDialog
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleDeleteCandidateConfirm}
        title="Remove Candidate Profile"
        message={`Are you sure you want to permanently remove candidate "${candidateToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Remove Candidate"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};
