import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Sparkles,
  TrendingUp,
  Plus,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Job, Candidate, Activity, DashboardStats } from '../types/client';
import { StatCard } from '../components/common/StatCard';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, jobsData, candidatesData, activitiesData] = await Promise.all([
          api.getDashboardStats(),
          api.getJobs({ sortBy: 'date' }),
          api.getCandidates({ sortBy: 'date' }),
          api.getActivities(6)
        ]);

        if (isMounted) {
          setStats(statsData);
          setRecentJobs(jobsData.slice(0, 5));
          setRecentCandidates(candidatesData.slice(0, 5));
          setActivities(activitiesData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-5 sm:p-6 lg:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202638] tracking-tight">
            Welcome back, {user?.name && user.name.toLowerCase() !== 'sarah jenkins' && user.name.toLowerCase() !== 'sarah' ? user.name.split(' ')[0] : 'Member'}
          </h2>
          <p className="text-xs sm:text-sm text-[#697386] leading-relaxed">
            Here is your live pipeline overview. You have{' '}
            <strong className="text-[#3978F6] font-semibold">{stats?.openJobs || 0} open positions</strong> and{' '}
            <strong className="text-[#202638] font-semibold">{stats?.totalCandidates || 0} active candidates</strong> in review.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={<Upload className="w-4 h-4 text-[#3978F6]" />}
            onClick={() => navigate('/candidates?upload=true')}
            className="w-full sm:w-auto justify-center"
          >
            Upload Resume
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/jobs?create=true')}
            className="w-full sm:w-auto justify-center"
          >
            Create New Job
          </Button>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <StatCard
            label="Total Jobs"
            value={stats?.totalJobs || 0}
            icon={<Briefcase className="w-4.5 h-4.5" />}
            subtext="All tracked positions"
          />
          <StatCard
            label="Open Jobs"
            value={stats?.openJobs || 0}
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            subtext="Currently recruiting"
            trend={{ value: 'Active', isPositive: true }}
          />
          <StatCard
            label="Total Candidates"
            value={stats?.totalCandidates || 0}
            icon={<Users className="w-4.5 h-4.5" />}
            subtext="In active pipeline"
          />
          <StatCard
            label="Resumes Processed"
            value={stats?.resumesProcessed || 0}
            icon={<FileText className="w-4.5 h-4.5" />}
            subtext="Parsed & indexed"
          />
          <StatCard
            label="Average Match Score"
            value={`${stats?.averageMatchScore || 0}%`}
            icon={<Sparkles className="w-4.5 h-4.5" />}
            subtext="Requirement alignment"
          />
        </div>
      )}

      {/* 3. Middle Section: Recent Jobs & Match Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Table (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8F0] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:px-5 sm:py-4 border-b border-[#E3E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202638] tracking-tight">Recent Job Requisitions</h3>
              <p className="text-[11px] text-[#697386]">Open and recently managed positions</p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-semibold text-[#3978F6] hover:text-[#2865DF] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {isLoading ? (
              <TableSkeleton rows={4} columns={5} />
            ) : recentJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-6 h-6 text-[#697386]" />}
                title="No jobs yet"
                description="Start by creating your first open job requisition."
                actionLabel="Create Job"
                onAction={() => navigate('/jobs?create=true')}
                className="border-0 py-10"
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E3E8F0] text-[11px] font-semibold text-[#697386] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Job Title</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Applicants</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8F0] text-xs">
                  {recentJobs.map(job => (
                    <tr key={job.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#202638]">
                        <span className="block truncate max-w-[200px]" title={job.title}>
                          {job.title}
                        </span>
                        <span className="text-[11px] text-[#697386] font-normal truncate block">
                          {job.location}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#697386]">{job.department}</td>
                      <td className="py-3 px-3 text-[#697386]">{job.employmentType}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-[#202638]">
                        {job.applicantsCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={getStatusBadgeVariant(job.status)} size="sm" dot>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/jobs')}
                          className="text-[#3978F6] hover:text-[#2865DF] font-medium text-xs cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Candidate Match Overview Chart & Distribution (1 col) */}
        <div className="bg-white rounded-xl border border-[#E3E8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#202638] tracking-tight">Match Score Overview</h3>
              <Sparkles className="w-4 h-4 text-[#3978F6]" />
            </div>
            <p className="text-[11px] text-[#697386] mb-5">
              Candidate distribution based on requirement alignment
            </p>

            {!stats || stats.totalCandidates === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-[#E3E8F0] rounded-xl bg-[#F8FAFD]">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E3E8F0] flex items-center justify-center text-[#3978F6] mx-auto mb-2.5 shadow-2xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#202638] mb-1">
                  Analytics will appear when real data is available.
                </h4>
                <p className="text-[11px] text-[#697386] max-w-xs mx-auto leading-relaxed">
                  Upload candidate resumes and analyze job matches to view score distributions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#202638] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#17845D]" />
                      Excellent (90% - 100%)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#202638]">
                      {stats?.distribution.excellent || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#17845D] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalCandidates
                            ? Math.min(100, Math.round(((stats.distribution.excellent || 0) / stats.totalCandidates) * 100))
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#202638] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3978F6]" />
                      Good (75% - 89%)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#202638]">
                      {stats?.distribution.good || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#3978F6] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalCandidates
                            ? Math.min(100, Math.round(((stats.distribution.good || 0) / stats.totalCandidates) * 100))
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#202638] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
                      Average (60% - 74%)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#202638]">
                      {stats?.distribution.average || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#B7791F] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalCandidates
                            ? Math.min(100, Math.round(((stats.distribution.average || 0) / stats.totalCandidates) * 100))
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#202638] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C94353]" />
                      Under 60%
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#202638]">
                      {stats?.distribution.low || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#C94353] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalCandidates
                            ? Math.min(100, Math.round(((stats.distribution.low || 0) / stats.totalCandidates) * 100))
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E3E8F0]">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              icon={<Users className="w-3.5 h-3.5 text-[#3978F6]" />}
              onClick={() => navigate('/candidates')}
            >
              Review Candidate Pipeline
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Candidates & Recruitment Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8F0] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:px-5 sm:py-4 border-b border-[#E3E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202638] tracking-tight">Recent Candidates</h3>
              <p className="text-[11px] text-[#697386]">Recently parsed and added candidates</p>
            </div>
            <button
              onClick={() => navigate('/candidates')}
              className="text-xs font-semibold text-[#3978F6] hover:text-[#2865DF] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {isLoading ? (
              <TableSkeleton rows={4} columns={5} />
            ) : recentCandidates.length === 0 ? (
              <EmptyState
                icon={<Users className="w-6 h-6 text-[#697386]" />}
                title="No candidates yet"
                description="Upload candidate resumes to start evaluating matches."
                actionLabel="Upload Resume"
                onAction={() => navigate('/candidates?upload=true')}
                className="border-0 py-10"
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E3E8F0] text-[11px] font-semibold text-[#697386] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Candidate</th>
                    <th className="py-2.5 px-3">Associated Role</th>
                    <th className="py-2.5 px-3">Skills Evidenced</th>
                    <th className="py-2.5 px-3 text-center">Match</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8F0] text-xs">
                  {recentCandidates.map(cand => (
                    <tr key={cand.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#202638]">
                        <span className="block truncate max-w-[180px]">{cand.name}</span>
                        <span className="text-[11px] text-[#697386] font-normal truncate block">
                          {cand.currentRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#697386]">
                        <span className="truncate block max-w-[150px]">
                          {cand.associatedJobTitle || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#697386]">
                        <span className="truncate block max-w-[180px]">
                          {cand.keySkills.slice(0, 3).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cand.matchScore > 0 ? (
                          <span
                            className={`inline-block font-mono tabular-nums font-bold text-xs px-2 py-0.5 rounded ${
                              cand.matchScore >= 90
                                ? 'bg-emerald-50 text-[#17845D]'
                                : cand.matchScore >= 75
                                ? 'bg-blue-50 text-[#3978F6]'
                                : 'bg-amber-50 text-[#B7791F]'
                            }`}
                          >
                            {cand.matchScore}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#697386]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={getStatusBadgeVariant(cand.status)} size="sm">
                          {cand.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/candidates')}
                          className="text-[#3978F6] hover:text-[#2865DF] font-medium text-xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recruitment Activity Stream (1 col) */}
        <div className="bg-white rounded-xl border border-[#E3E8F0] shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#202638] tracking-tight">Recruitment Activity</h3>
            <Clock className="w-4 h-4 text-[#697386]" />
          </div>
          <p className="text-[11px] text-[#697386] mb-4">
            Recent actions and workflow milestones
          </p>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[320px]">
            {activities.length === 0 ? (
              <div className="py-8 px-3 text-center">
                <div className="w-9 h-9 rounded-full bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#697386] mx-auto mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#202638]">No recruitment activity yet</p>
                <p className="text-[11px] text-[#697386] mt-0.5">Actions and status changes will be tracked here.</p>
              </div>
            ) : (
              activities.map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#EAF1FF] text-[#3978F6] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#202638] truncate">{act.title}</p>
                    <p className="text-[11px] text-[#697386] leading-relaxed line-clamp-2">{act.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums block mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {act.user}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
