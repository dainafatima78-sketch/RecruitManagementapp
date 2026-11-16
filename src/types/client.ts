export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'Open' | 'In Review' | 'Draft' | 'Closed';
export type CandidateStatus = 'New' | 'In Review' | 'Shortlisted' | 'Rejected';
export type QuestionCategory = 'Technical' | 'Behavioral' | 'Situational' | 'HR' | 'Role-specific' | 'General';
export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  applicantsCount: number;
  status: JobStatus;
  createdDate: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: string;
  educationRequirements: string;
  responsibilities: string[];
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  currentRole: string;
  keySkills: string[];
  experienceYears: number;
  education: string;
  educationDetails?: EducationItem[];
  workHistory?: WorkExperience[];
  certifications?: string[];
  associatedJobId?: string;
  associatedJobTitle?: string;
  matchScore: number;
  dateAdded: string;
  status: CandidateStatus;
  summary: string;
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeTextContent?: string;
}

export interface MatchAnalysis {
  id: string;
  userId: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  experienceComparison: {
    required: string;
    candidate: string;
    verdict: 'Met' | 'Exceeded' | 'Partially Met' | 'Under';
  };
  educationComparison: {
    required: string;
    candidate: string;
    verdict: 'Met' | 'Exceeded' | 'Alternative Match';
  };
  missingInfoNotes?: string[];
  suggestedQuestions: string[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  userId: string;
  number: number;
  role: string;
  relatedJobId?: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  evaluationCriteria: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'job_created' | 'job_updated' | 'resume_uploaded' | 'candidate_shortlisted' | 'matching_analyzed' | 'interviews_generated';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  resumesProcessed: number;
  averageMatchScore: number;
  distribution: {
    excellent: number;
    good: number;
    average: number;
    low: number;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

export interface AiStatusResponse {
  configured: boolean;
  provider: string;
  model: string;
  latencyMs?: number;
  status: string;
  error?: string;
}

export interface AiAssistantResponse {
  success: boolean;
  answer: string;
  model: string;
  suggestions?: string[];
  error?: string;
}
