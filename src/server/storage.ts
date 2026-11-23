import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserRecord,
  SessionRecord,
  JobRecord,
  CandidateRecord,
  MatchAnalysisRecord,
  InterviewQuestionRecord,
  ActivityRecord
} from './types';

interface DatabaseData {
  users: UserRecord[];
  sessions: SessionRecord[];
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  matches: MatchAnalysisRecord[];
  interviews: InterviewQuestionRecord[];
  activities: ActivityRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Password hashing utility using PBKDF2
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

class StorageManager {
  private data: DatabaseData = {
    users: [],
    sessions: [],
    jobs: [],
    candidates: [],
    matches: [],
    interviews: [],
    activities: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        const removedUserIds = new Set(
          (this.data.users || [])
            .filter(user => user.id === 'user-demo-1')
            .map(user => user.id)
        );
        if (removedUserIds.size > 0) {
          this.data.users = (this.data.users || []).filter(user => !removedUserIds.has(user.id));
          this.data.sessions = (this.data.sessions || []).filter(session => !removedUserIds.has(session.userId));
          this.save();
        }
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file, initializing in-memory fallback:', err);
      this.seedInitialData();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  private seedInitialData() {
    this.data.users = [];
    this.data.sessions = [];
    this.data.jobs = [];
    this.data.candidates = [];
    this.data.activities = [];
    this.data.matches = [];
    this.data.interviews = [];
  }

  // User methods
  getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(name: string, email: string, password: string): UserRecord {
    const { salt, hash } = hashPassword(password);
    const newUser: UserRecord = {
      id: `user-${crypto.randomUUID()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      salt,
      role: 'Recruiter',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Session methods
  createSession(userId: string): SessionRecord {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const session: SessionRecord = { token, userId, expiresAt };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  getSession(token: string): SessionRecord | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt < Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // Jobs methods
  getJobs(userId: string): JobRecord[] {
    return this.data.jobs.filter(j => j.userId === userId);
  }

  getJobById(userId: string, id: string): JobRecord | undefined {
    return this.data.jobs.find(j => j.userId === userId && j.id === id);
  }

  createJob(userId: string, jobData: Omit<JobRecord, 'id' | 'userId' | 'createdDate' | 'applicantsCount'>): JobRecord {
    const newJob: JobRecord = {
      ...jobData,
      id: `job-${crypto.randomUUID()}`,
      userId,
      createdDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0
    };
    this.data.jobs.unshift(newJob);
    this.logActivity(userId, 'job_created', 'Job Created', `Published new requisition: ${newJob.title}`, 'Member');
    this.save();
    return newJob;
  }

  updateJob(userId: string, id: string, updates: Partial<JobRecord>): JobRecord | null {
    const job = this.getJobById(userId, id);
    if (!job) return null;
    Object.assign(job, updates);
    this.logActivity(userId, 'job_updated', 'Job Updated', `Updated requisition details for: ${job.title}`, 'Member');
    this.save();
    return job;
  }

  deleteJob(userId: string, id: string): boolean {
    const index = this.data.jobs.findIndex(j => j.userId === userId && j.id === id);
    if (index === -1) return false;
    this.data.jobs.splice(index, 1);
    this.data.candidates.forEach(c => {
      if (c.userId === userId && c.associatedJobId === id) {
        c.associatedJobId = undefined;
        c.associatedJobTitle = 'Unassigned';
      }
    });
    this.save();
    return true;
  }

  // Candidates methods
  getCandidates(userId: string): CandidateRecord[] {
    return this.data.candidates.filter(c => c.userId === userId);
  }

  getCandidateById(userId: string, id: string): CandidateRecord | undefined {
    return this.data.candidates.find(c => c.userId === userId && c.id === id);
  }

  createCandidate(userId: string, candidateData: Omit<CandidateRecord, 'id' | 'userId' | 'dateAdded'>): CandidateRecord {
    const newCandidate: CandidateRecord = {
      ...candidateData,
      id: `cand-${crypto.randomUUID()}`,
      userId,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    this.data.candidates.unshift(newCandidate);

    if (newCandidate.associatedJobId) {
      const job = this.getJobById(userId, newCandidate.associatedJobId);
      if (job) {
        job.applicantsCount = (job.applicantsCount || 0) + 1;
      }
    }

    this.logActivity(userId, 'resume_uploaded', 'Candidate Added', `Added candidate profile: ${newCandidate.name}`, 'Member');
    this.save();
    return newCandidate;
  }

  updateCandidate(userId: string, id: string, updates: Partial<CandidateRecord>): CandidateRecord | null {
    const cand = this.getCandidateById(userId, id);
    if (!cand) return null;
    Object.assign(cand, updates);
    this.save();
    return cand;
  }

  deleteCandidate(userId: string, id: string): boolean {
    const index = this.data.candidates.findIndex(c => c.userId === userId && c.id === id);
    if (index === -1) return false;
    const cand = this.data.candidates[index];
    if (cand.associatedJobId) {
      const job = this.getJobById(userId, cand.associatedJobId);
      if (job && job.applicantsCount > 0) {
        job.applicantsCount -= 1;
      }
    }
    this.data.candidates.splice(index, 1);
    this.save();
    return true;
  }

  // Matches methods
  getMatches(userId: string, jobId?: string): MatchAnalysisRecord[] {
    return this.data.matches.filter(m => m.userId === userId && (!jobId || m.jobId === jobId));
  }

  saveMatchAnalysis(analysis: MatchAnalysisRecord) {
    const existingIndex = this.data.matches.findIndex(
      m => m.userId === analysis.userId && m.candidateId === analysis.candidateId && m.jobId === analysis.jobId
    );
    if (existingIndex >= 0) {
      this.data.matches[existingIndex] = analysis;
    } else {
      this.data.matches.unshift(analysis);
    }

    const candidate = this.getCandidateById(analysis.userId, analysis.candidateId);
    if (candidate) {
      candidate.matchScore = analysis.overallScore;
    }

    this.logActivity(analysis.userId, 'matching_analyzed', 'Match Analysis', `Analyzed ${analysis.candidateName} for ${analysis.jobTitle} (${analysis.overallScore}%)`, 'Member');
    this.save();
  }

  // Interviews methods
  getInterviews(userId: string): InterviewQuestionRecord[] {
    return this.data.interviews.filter(i => i.userId === userId);
  }

  saveInterviewQuestions(userId: string, questions: InterviewQuestionRecord[]) {
    this.data.interviews.unshift(...questions);
    this.logActivity(userId, 'interviews_generated', 'Interview Questions', `Generated ${questions.length} interview questions for ${questions[0]?.role || 'candidate'}`, 'Member');
    this.save();
  }

  updateInterviewQuestion(userId: string, id: string, updates: Partial<InterviewQuestionRecord>): InterviewQuestionRecord | null {
    const q = this.data.interviews.find(i => i.userId === userId && i.id === id);
    if (!q) return null;
    Object.assign(q, updates);
    this.save();
    return q;
  }

  // Activities methods
  getActivities(userId: string, limit: number = 10): ActivityRecord[] {
    return this.data.activities
      .filter(a => a.userId === userId)
      .slice(0, limit);
  }

  logActivity(userId: string, type: ActivityRecord['type'], title: string, description: string, user: string = 'Member') {
    const newActivity: ActivityRecord = {
      id: `act-${crypto.randomUUID()}`,
      userId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      user
    };
    this.data.activities.unshift(newActivity);
    if (this.data.activities.length > 100) {
      this.data.activities = this.data.activities.slice(0, 100);
    }
  }

  // Stats calculation
  getDashboardStats(userId: string) {
    const userJobs = this.getJobs(userId);
    const userCandidates = this.getCandidates(userId);
    const totalJobs = userJobs.length;
    const openJobs = userJobs.filter(j => j.status === 'Open').length;
    const totalCandidates = userCandidates.length;
    const resumesProcessed = userCandidates.filter(c => c.resumeFileName).length;

    const scores = userCandidates.map(c => c.matchScore).filter(s => s > 0);
    const averageMatchScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const distribution = {
      excellent: userCandidates.filter(c => c.matchScore >= 90).length,
      good: userCandidates.filter(c => c.matchScore >= 75 && c.matchScore < 90).length,
      average: userCandidates.filter(c => c.matchScore >= 60 && c.matchScore < 75).length,
      low: userCandidates.filter(c => c.matchScore < 60).length
    };

    return {
      totalJobs,
      openJobs,
      totalCandidates,
      resumesProcessed,
      averageMatchScore,
      distribution
    };
  }
}

export const storage = new StorageManager();
