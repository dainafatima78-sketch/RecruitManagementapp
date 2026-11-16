import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Calendar
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { Candidate, CandidateStatus } from '../../types/client';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onStatusUpdated: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onStatusUpdated
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!candidate) return null;

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    try {
      setIsUpdatingStatus(true);
      await api.updateCandidate(candidate.id, { status: newStatus });
      addToast('success', 'Status Updated', `${candidate.name} is now ${newStatus}.`);
      onStatusUpdated();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyResumeText = () => {
    if (!candidate.resumeTextContent) return;
    navigator.clipboard.writeText(candidate.resumeTextContent);
    setIsCopied(true);
    addToast('info', 'Copied', 'Resume text copied to clipboard.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadSampleResume = () => {
    const element = document.createElement('a');
    const file = new Blob([candidate.resumeTextContent || `${candidate.name} Resume Details`], {
      type: 'text/plain'
    });
    element.href = URL.createObjectURL(file);
    element.download = candidate.resumeFileName || `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('success', 'Downloaded', 'Resume document exported.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={candidate.name}
      subtitle={candidate.currentRole || 'Software Professional'}
      maxWidth="3xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#697386]">Status:</span>
            <div className="flex items-center gap-1.5">
              {(['New', 'In Review', 'Shortlisted', 'Rejected'] as CandidateStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={candidate.status === status || isUpdatingStatus}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    candidate.status === status
                      ? 'bg-[#3978F6] text-white'
                      : 'bg-white border border-[#E3E8F0] text-[#202638] hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E3E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#EAF1FF] border border-[#3978F6]/30 text-[#3978F6] text-base font-bold flex items-center justify-center shrink-0">
              {candidate.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#202638]">{candidate.name}</h3>
                <Badge variant={getStatusBadgeVariant(candidate.status)} size="sm">
                  {candidate.status}
                </Badge>
              </div>
              <p className="text-xs text-[#697386] mt-0.5">
                Applied for: <strong className="text-[#202638]">{candidate.associatedJobTitle || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          {candidate.matchScore > 0 && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-[#E3E8F0] shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#3978F6]" />
              <div>
                <span className="text-[10px] text-[#697386] uppercase font-bold block">Match Score</span>
                <span className="text-sm font-mono tabular-nums font-bold text-[#3978F6]">
                  {candidate.matchScore}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#697386]">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E3E8F0] bg-white">
            <Mail className="w-4 h-4 text-[#3978F6] shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E3E8F0] bg-white">
            <Phone className="w-4 h-4 text-[#3978F6] shrink-0" />
            <span className="truncate">{candidate.phone || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E3E8F0] bg-white">
            <MapPin className="w-4 h-4 text-[#3978F6] shrink-0" />
            <span className="truncate">{candidate.location || 'Not specified'}</span>
          </div>
        </div>

        {/* Tab Controls: Profile vs Resume View */}
        <div className="flex items-center gap-1 border-b border-[#E3E8F0] pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#EAF1FF] text-[#3978F6]'
                : 'text-[#697386] hover:text-[#202638]'
            }`}
          >
            Profile & Qualifications
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'bg-[#EAF1FF] text-[#3978F6]'
                : 'text-[#697386] hover:text-[#202638]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume Document Preview</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' ? (
          <div className="space-y-5">
            {/* Professional Summary */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">
                Professional Summary
              </h4>
              <p className="text-xs text-[#202638] leading-relaxed p-3.5 rounded-xl border border-[#E3E8F0] bg-[#F8FAFD]">
                {candidate.summary || 'Not specified'}
              </p>
            </div>

            {/* Key Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">
                Demonstrated Key Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {candidate.keySkills.length > 0 ? (
                  candidate.keySkills.map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#E3E8F0] text-[#202638] shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#697386]">Not specified</span>
                )}
              </div>
            </div>

            {/* Work History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#3978F6]" />
                <span>Work Experience ({candidate.experienceYears} Years Confirmed)</span>
              </h4>
              {candidate.workHistory && candidate.workHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {candidate.workHistory.map((w, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#E3E8F0] bg-white">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-[#202638]">{w.role}</span>
                        <span className="text-[11px] text-[#697386] font-mono tabular-nums shrink-0">
                          {w.duration}
                        </span>
                      </div>
                      <p className="text-xs text-[#3978F6] font-medium mb-1.5">{w.company}</p>
                      <p className="text-xs text-[#697386] leading-relaxed">{w.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#697386] p-3 rounded-lg border border-[#E3E8F0] bg-[#F8FAFD]">
                  Not specified in detailed resume structure
                </p>
              )}
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#3978F6]" />
                  <span>Education</span>
                </h4>
                <div className="p-3 rounded-xl border border-[#E3E8F0] bg-white text-xs space-y-1">
                  <p className="font-semibold text-[#202638]">{candidate.education || 'Not specified'}</p>
                  {candidate.educationDetails?.map((e, idx) => (
                    <p key={idx} className="text-[#697386] text-[11px]">{e.institution} · {e.year}</p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#3978F6]" />
                  <span>Certifications</span>
                </h4>
                <div className="p-3 rounded-xl border border-[#E3E8F0] bg-white text-xs space-y-1">
                  {candidate.certifications && candidate.certifications.length > 0 ? (
                    candidate.certifications.map((c, idx) => (
                      <p key={idx} className="text-[#202638] font-medium">✓ {c}</p>
                    ))
                  ) : (
                    <p className="text-[#697386]">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Resume Tab */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3978F6]" />
                <span className="text-xs font-semibold text-[#202638]">
                  {candidate.resumeFileName || 'Extracted_Resume.txt'}
                </span>
                {candidate.resumeFileSize && (
                  <span className="text-[10px] text-[#697386] font-mono tabular-nums">
                    ({candidate.resumeFileSize})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={isCopied ? <Check className="w-3.5 h-3.5 text-[#17845D]" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyResumeText}
                >
                  {isCopied ? 'Copied' : 'Copy Text'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleDownloadSampleResume}
                >
                  Download
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E3E8F0] bg-[#F8FAFD] font-mono text-xs text-[#202638] max-h-[380px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
              {candidate.resumeTextContent || 'No raw document text available for this candidate.'}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
