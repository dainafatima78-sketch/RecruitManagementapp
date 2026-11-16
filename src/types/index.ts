export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type JobStatus = 'Open' | 'In Review' | 'Draft' | 'Closed';

export interface Job {
  id: string;
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
  minExperience: string; // e.g. "3+ years"
  educationRequirements: string;
  responsibilities: string[];
}

export type CandidateStatus = 'New' | 'In Review' | 'Shortlisted' | 'Rejected';

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
  associatedJobId: string;
  associatedJobTitle: string;
  matchScore: number; // 0 - 100
  dateAdded: string;
  status: CandidateStatus;
  summary: string;
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeTextPlaceholder?: string;
}

export interface MatchAnalysis {
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
}

export type QuestionCategory = 'Technical' | 'Behavioral' | 'Situational' | 'HR' | 'Role-specific' | 'General';
export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewQuestion {
  id: string;
  number: number;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  evaluationCriteria: string;
}

export interface ActivityItem {
  id: string;
  type: 'job_created' | 'resume_uploaded' | 'candidate_shortlisted' | 'interview_generated' | 'status_updated';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}
