import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { api } from '../api/client';
import { Job, EmploymentType, JobStatus } from '../types/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Select } from '../components/common/Select';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Input } from '../components/common/Input';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formEmploymentType, setFormEmploymentType] = useState<EmploymentType>('Full-time');
  const [formDescription, setFormDescription] = useState('');
  const [formRequiredSkills, setFormRequiredSkills] = useState('');
  const [formPreferredSkills, setFormPreferredSkills] = useState('');
  const [formMinExperience, setFormMinExperience] = useState('3+ years');
  const [formEducation, setFormEducation] = useState('B.S. in Computer Science or equivalent');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Confirm Dialog
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active action dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Check URL query param for ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleOpenCreateModal();
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJobs({
        search: searchTerm,
        status: statusFilter,
        employmentType: typeFilter,
        sortBy
      });
      setJobs(data);
    } catch (err: any) {
      addToast('error', 'Failed to fetch jobs', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [searchTerm, statusFilter, typeFilter, sortBy]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormTitle('');
    setFormDepartment('');
    setFormLocation('');
    setFormEmploymentType('Full-time');
    setFormDescription('');
    setFormRequiredSkills('');
    setFormPreferredSkills('');
    setFormMinExperience('');
    setFormEducation('');
    setFormResponsibilities('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setFormTitle(job.title);
    setFormDepartment(job.department);
    setFormLocation(job.location);
    setFormEmploymentType(job.employmentType);
    setFormDescription(job.description);
    setFormRequiredSkills(job.requiredSkills.join(', '));
    setFormPreferredSkills(job.preferredSkills.join(', '));
    setFormMinExperience(job.minExperience);
    setFormEducation(job.educationRequirements);
    setFormResponsibilities(job.responsibilities.join('\n'));
    setFormErrors({});
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleSaveJob = async (statusToSet: JobStatus) => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Job title is required';
    if (!formDepartment.trim()) errors.department = 'Department is required';
    if (!formLocation.trim()) errors.location = 'Location is required';
    if (!formDescription.trim()) errors.description = 'Job description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<Job> = {
        title: formTitle.trim(),
        department: formDepartment.trim(),
        location: formLocation.trim(),
        employmentType: formEmploymentType,
        description: formDescription.trim(),
        requiredSkills: formRequiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: formPreferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: formMinExperience.trim(),
        educationRequirements: formEducation.trim(),
        responsibilities: formResponsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        status: statusToSet
      };

      if (editingJob) {
        await api.updateJob(editingJob.id, payload);
        addToast('success', 'Job Updated', `Requisition "${formTitle}" updated successfully.`);
      } else {
        await api.createJob(payload);
        addToast('success', 'Job Created', `Requisition "${formTitle}" has been ${statusToSet === 'Open' ? 'published' : 'saved as draft'}.`);
      }

      setIsModalOpen(false);
      loadJobs();
    } catch (err: any) {
      addToast('error', 'Error saving job', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleJobStatus = async (job: Job, newStatus: JobStatus) => {
    try {
      await api.updateJobStatus(job.id, newStatus);
      addToast('info', 'Status Updated', `${job.title} status changed to ${newStatus}.`);
      loadJobs();
      setOpenDropdownId(null);
    } catch (err: any) {
      addToast('error', 'Error updating status', err.message);
    }
  };

  const handleDeleteJobConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteJob(jobToDelete.id);
      addToast('success', 'Job Deleted', `Requisition "${jobToDelete.title}" has been removed.`);
      setJobToDelete(null);
      loadJobs();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202638] tracking-tight">Job Requisitions</h2>
          <p className="text-xs text-[#697386]">
            Manage open requisitions, review candidate pipelines, and publish new roles.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto justify-center"
        >
          Create Job
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchBar
            value={searchTerm}
            onChange={val => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by title, department, skills..."
          />

          <Select
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Open', label: 'Open' },
              { value: 'In Review', label: 'In Review' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Closed', label: 'Closed' }
            ]}
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            options={[
              { value: 'All', label: 'All Employment Types' },
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Internship', label: 'Internship' }
            ]}
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            options={[
              { value: 'date', label: 'Sort by: Newest Date' },
              { value: 'title', label: 'Sort by: Job Title' },
              { value: 'applicants', label: 'Sort by: Applicant Count' }
            ]}
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {(searchTerm || statusFilter !== 'All' || typeFilter !== 'All') && (
          <div className="flex items-center justify-between pt-2 text-xs text-[#697386] border-t border-[#E3E8F0]">
            <span>
              Found <strong className="text-[#202638] font-semibold font-mono tabular-nums">{jobs.length}</strong> matching positions
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setTypeFilter('All');
              }}
              className="text-[#3978F6] hover:text-[#2865DF] font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-[#E3E8F0] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <TableSkeleton rows={6} columns={8} />
          ) : (
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-[#F8FAFD] border-b border-[#E3E8F0] text-[11px] font-semibold text-[#697386] uppercase tracking-wider">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Applicants</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8F0] text-xs">
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#697386] shadow-2xs">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#202638]">No jobs found.</p>
                          <p className="text-xs text-[#697386] mt-0.5">
                            {searchTerm || statusFilter !== 'All' || typeFilter !== 'All'
                              ? 'No requisitions match your search filters.'
                              : 'Get started by creating your first job requisition.'}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={handleOpenCreateModal}
                        >
                          Create Job
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#202638]">
                      <span className="block text-sm truncate max-w-[220px]" title={job.title}>
                        {job.title}
                      </span>
                      <span className="text-[11px] text-[#697386] font-normal truncate block max-w-[220px]">
                        {job.requiredSkills.slice(0, 3).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#202638] font-medium">{job.department}</td>
                    <td className="py-3.5 px-3 text-[#697386]">{job.location}</td>
                    <td className="py-3.5 px-3 text-[#697386]">{job.employmentType}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/candidates?jobId=${job.id}`)}
                        className="font-mono tabular-nums font-semibold text-[#3978F6] hover:underline"
                        title="View candidates for this job"
                      >
                        {job.applicantsCount || 0}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={getStatusBadgeVariant(job.status)} size="sm" dot>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#697386] font-mono tabular-nums">
                      {job.createdDate}
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/candidates?jobId=${job.id}`)}
                          className="p-1.5 text-[#697386] hover:text-[#3978F6] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="View applicants"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 text-[#697386] hover:text-[#202638] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit requisition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setJobToDelete(job)}
                          className="p-1.5 text-[#697386] hover:text-[#C94353] hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={jobs.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? `Edit Job: ${editingJob.title}` : 'Create New Job Requisition'}
        subtitle="Specify candidate qualifications, responsibilities, and department parameters."
        maxWidth="2xl"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSaveJob('Draft')}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSaveJob('Open')}
              isLoading={isSaving}
            >
              {editingJob ? 'Update & Publish' : 'Publish Job'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              error={formErrors.title}
              required
            />
            <Input
              label="Department"
              value={formDepartment}
              onChange={e => setFormDepartment(e.target.value)}
              placeholder="e.g. Engineering, Design, Product"
              error={formErrors.department}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={formLocation}
              onChange={e => setFormLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA (Hybrid)"
              error={formErrors.location}
              required
            />
            <Select
              label="Employment Type"
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Internship', label: 'Internship' }
              ]}
              value={formEmploymentType}
              onChange={e => setFormEmploymentType(e.target.value as EmploymentType)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202638] mb-1.5">
              Job Description <span className="text-[#C94353]">*</span>
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of the role, impact, and team context..."
              className={`block w-full rounded-lg border bg-white p-3 text-sm text-[#202638] placeholder:text-[#697386]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6] ${
                formErrors.description ? 'border-[#C94353]' : 'border-[#E3E8F0]'
              }`}
            />
            {formErrors.description && (
              <p className="text-xs text-[#C94353] mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Required Skills (comma separated)"
              value={formRequiredSkills}
              onChange={e => setFormRequiredSkills(e.target.value)}
              placeholder="React, TypeScript, Tailwind CSS, SQL"
              helperText="These skills are strictly evaluated in AI matching"
            />
            <Input
              label="Preferred Skills (comma separated)"
              value={formPreferredSkills}
              onChange={e => setFormPreferredSkills(e.target.value)}
              placeholder="Next.js, GraphQL, Playwright"
              helperText="Bonus qualifications and nice-to-haves"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Relevant Experience"
              value={formMinExperience}
              onChange={e => setFormMinExperience(e.target.value)}
              placeholder="e.g. 5+ years"
            />
            <Input
              label="Education Requirements"
              value={formEducation}
              onChange={e => setFormEducation(e.target.value)}
              placeholder="e.g. B.S. in Computer Science or equivalent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202638] mb-1.5">
              Core Responsibilities (one per line)
            </label>
            <textarea
              rows={3}
              value={formResponsibilities}
              onChange={e => setFormResponsibilities(e.target.value)}
              placeholder="Architect high-performance web applications&#10;Lead technical design discussions&#10;Mentor engineering teammates"
              className="block w-full rounded-lg border border-[#E3E8F0] bg-white p-3 text-sm text-[#202638] placeholder:text-[#697386]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3978F6]/20 focus:border-[#3978F6]"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Job Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJobConfirm}
        title="Delete Job Requisition"
        message={`Are you sure you want to permanently delete "${jobToDelete?.title}"? Existing candidate applications will be preserved and unassigned.`}
        confirmLabel="Delete Job"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};
