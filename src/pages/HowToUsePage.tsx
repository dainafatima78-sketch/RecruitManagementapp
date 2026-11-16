import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Upload,
  UserCheck,
  Sparkles,
  MessageSquareText,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const HowToUsePage: React.FC = () => {
  const navigate = useNavigate();

  const workflowSteps = [
    {
      number: '01',
      title: 'Create a Job Requisition',
      description: 'Define your role specifications, department, minimum experience, and required vs. preferred technical skills.',
      icon: Briefcase,
      link: '/jobs?create=true',
      linkText: 'Create New Job'
    },
    {
      number: '02',
      title: 'Upload Candidate Resumes',
      description: 'Upload resumes in PDF or DOCX format. The system parses text, extracts candidate contact info, work history, and verified skills.',
      icon: Upload,
      link: '/candidates?upload=true',
      linkText: 'Upload Resumes'
    },
    {
      number: '03',
      title: 'Review Candidate Profiles',
      description: 'Inspect extracted profiles, view work experience timelines, and inspect the raw formatted resume text preview.',
      icon: UserCheck,
      link: '/candidates',
      linkText: 'Open Candidates'
    },
    {
      number: '04',
      title: 'Automatic AI Requirement Matching',
      description: 'Upon resume upload, RecruitAI automatically evaluates candidate skills, experience, and education directly against open requisitions.',
      icon: Sparkles,
      link: '/candidates',
      linkText: 'Review Matches'
    },
    {
      number: '05',
      title: 'Generate Tailored Interview Questions',
      description: 'Synthesize role-specific technical, behavioral, or situational questions complete with evaluation criteria and expected answers.',
      icon: MessageSquareText,
      link: '/interview-generator',
      linkText: 'Generate Questions'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#3978F6] uppercase tracking-wider block mb-1">
            Recruitment Workflow Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202638] tracking-tight">
            How RecruitAI Accelerates Hiring
          </h2>
          <p className="text-xs sm:text-sm text-[#697386] mt-2 leading-relaxed">
            RecruitAI empowers recruiting teams and engineering leaders to source, parse resumes, objectively evaluate candidate alignment, and conduct rigorous, structured interviews.
          </p>
        </div>
      </div>

      {/* 6-Step Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {workflowSteps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono tabular-nums text-xs font-bold px-2 py-0.5 rounded bg-[#EAF1FF] text-[#3978F6]">
                      Step {step.number}
                    </span>
                    <h3 className="text-sm font-bold text-[#202638] tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] flex items-center justify-center text-[#3978F6] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-[#697386] leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E3E8F0] flex items-center justify-between">
                <button
                  onClick={() => navigate(step.link)}
                  className="text-xs font-semibold text-[#3978F6] hover:text-[#2865DF] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{step.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Principles & AI Philosophy */}
      <div className="bg-white rounded-xl border border-[#E3E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#17845D]" />
          <h3 className="text-base font-bold text-[#202638]">Recruiter-First AI Principles</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#697386] pt-1">
          <div className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] space-y-1">
            <strong className="text-[#202638] block font-semibold">Human In The Loop</strong>
            <p className="leading-relaxed">
              AI provides objective evidence and synthesis to guide decision-making, never automatic rejection of applicants.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] space-y-1">
            <strong className="text-[#202638] block font-semibold">Auditable Match Evidence</strong>
            <p className="leading-relaxed">
              Every match score links directly to verified skills, experience thresholds, and specific resume excerpts.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#E3E8F0] space-y-1">
            <strong className="text-[#202638] block font-semibold">Secure Data Isolation</strong>
            <p className="leading-relaxed">
              All candidate resumes, requisitions, and question sets are securely partitioned to your authenticated account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
