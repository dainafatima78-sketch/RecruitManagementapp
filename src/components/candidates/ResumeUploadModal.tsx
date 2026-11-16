import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Job, Candidate, MatchAnalysis } from '../../types/client';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onUploadSuccess: (candidate: Candidate, matchAnalysis?: MatchAnalysis) => void;
  defaultJobId?: string;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onUploadSuccess,
  defaultJobId
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openJobs = jobs.filter(j => j.status === 'Open');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-selection rules
  useEffect(() => {
    if (isOpen) {
      if (defaultJobId) {
        setSelectedJobId(defaultJobId);
      } else if (openJobs.length === 1) {
        // Rule: If exactly 1 open job exists, automatically select that job
        setSelectedJobId(openJobs[0].id);
      } else {
        setSelectedJobId('');
      }
    }
  }, [isOpen, defaultJobId, jobs]);

  const resetState = () => {
    setSelectedFile(null);
    setSelectedJobId('');
    setIsDragging(false);
    setIsUploading(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');
    const isPdf = file.name.endsWith('.pdf');
    const isTxt = file.name.endsWith('.txt');

    if (!validTypes.includes(file.type) && !isDocx && !isPdf && !isTxt) {
      setErrorMsg('Please upload a PDF (.pdf), Word (.docx, .doc), or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a resume file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await api.uploadResume(selectedFile, selectedJobId || undefined);

      addToast(
        'success',
        res.matchAnalysis ? 'Resume Parsed & AI Matched' : 'Resume Uploaded',
        res.matchAnalysis
          ? `${res.candidate.name} scored ${res.matchAnalysis.overallScore}% match against ${res.matchAnalysis.jobTitle}.`
          : `${selectedFile.name} has been processed successfully.`
      );

      resetState();
      onUploadSuccess(res.candidate, res.matchAnalysis);
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      const msg = err.message || 'Failed to upload and parse resume.';
      setErrorMsg(msg);
      addToast('error', 'Upload Failed', msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload & Parse Candidate Resume"
      subtitle="Supported formats: PDF, DOCX, DOC, TXT. Our parser automatically extracts skills, experience, and runs automatic AI matching."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Assignment & AI Matching Rule Section */}
        <div>
          {openJobs.length === 0 ? (
            /* Rule 4: If no open jobs exist, clearly explain that an open job is needed to run matching */
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-[#B7791F] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B7791F] mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block text-[#B7791F]">
                  No open job requisitions currently available
                </span>
                <p className="text-slate-600 leading-relaxed">
                  To automatically run instant AI matching upon resume upload, an open job is required. You can still upload this resume to your general talent pool, or create a job first.
                </p>
              </div>
            </div>
          ) : openJobs.length === 1 && !defaultJobId ? (
            /* Rule 2: If exactly 1 open job exists, automatically select that job */
            <div className="p-3.5 rounded-xl border border-[#3978F6]/30 bg-[#EAF1FF]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#3978F6] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3978F6]">
                      Instant AI Matching Target
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-[#17845D] font-bold px-1.5 py-0.2 rounded">
                      Auto-Selected
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#202638] truncate">
                    {openJobs[0].title}
                    <span className="text-xs font-normal text-[#697386] ml-1.5">
                      • {openJobs[0].department} ({openJobs[0].minExperience})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Rule 3: If multiple open jobs exist, prompt the recruiter to select */
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#202638] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3978F6]" />
                  <span>Job Requisition for AI Matching *</span>
                </label>
                {selectedJobId && (
                  <span className="text-[11px] text-[#17845D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto AI Matching Active
                  </span>
                )}
              </div>
              <Select
                name="jobId"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: '', label: '-- Select an open job requisition --' },
                  ...openJobs.map((job) => ({
                    value: job.id,
                    label: `${job.title} — ${job.department} (${job.minExperience} exp)`
                  }))
                ]}
                disabled={isUploading}
              />
              <p className="mt-1 text-[11px] text-[#697386]">
                {selectedJobId
                  ? 'AI matching analysis will trigger immediately upon upload.'
                  : 'Select an open job to automatically calculate candidate fit, skills, and gaps upon upload.'}
              </p>
            </div>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-semibold text-[#202638] uppercase tracking-wider mb-2">
            Resume Document *
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#3978F6] bg-[#EAF1FF]/40'
                : selectedFile
                ? 'border-[#17845D]/50 bg-[#F8FAFD]'
                : 'border-[#E3E8F0] hover:border-[#3978F6] bg-[#F8FAFD]/60 hover:bg-[#F8FAFD]'
            } ${isUploading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#EAF1FF] text-[#3978F6] flex items-center justify-center shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#202638] max-w-xs truncate mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#697386] mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#C94353] hover:text-[#C94353]/80 font-medium pt-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E3E8F0] text-[#3978F6] flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#202638]">
                    <span className="text-[#3978F6] font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-[#697386]">
                    PDF, DOCX, DOC or TXT (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs text-[#C94353] bg-[#C94353]/10 border border-[#C94353]/20 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Uploading & AI Matching progress indicator */}
        {isUploading && (
          <div className="p-3.5 bg-[#EAF1FF] border border-[#3978F6]/30 rounded-xl flex items-center justify-between text-xs font-semibold text-[#202638]">
            <span className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-[#3978F6] animate-spin shrink-0" />
              <span>
                {selectedJobId
                  ? 'Parsing resume text & running automated AI matching...'
                  : 'Parsing resume text & extracting candidate details...'}
              </span>
            </span>
            <span className="text-[#3978F6] text-[11px] font-bold uppercase tracking-wider shrink-0">
              Processing
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-[#E3E8F0]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedFile || isUploading}
            isLoading={isUploading}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isUploading
              ? 'Analyzing...'
              : selectedJobId
              ? 'Upload & Run AI Match'
              : 'Upload to Candidate Pool'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
