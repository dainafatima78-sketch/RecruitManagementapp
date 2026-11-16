import {
  User,
  Job,
  Candidate,
  MatchAnalysis,
  InterviewQuestion,
  Activity,
  DashboardStats
} from '../types/client';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const finalUrl = resolveUrl(url);
  const token = localStorage.getItem('recruitai_token');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(finalUrl, {
      ...options,
      headers,
      credentials: 'include'
    });
  } catch (netErr: any) {
    throw new Error(`Connection error reaching ${finalUrl}: ${netErr.message || 'Server unreachable'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    const rawText = await res.text();
    const isHtml = rawText.trim().toLowerCase().startsWith('<!doctype') || rawText.trim().toLowerCase().startsWith('<html');

    if (isHtml) {
      throw new Error(
        `API endpoint (${finalUrl}) returned an HTML document (${res.status} ${res.statusText}) instead of JSON. Ensure the backend server is running and the route is registered.`
      );
    }

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${rawText.slice(0, 150)}`);
    }

    throw new Error(`Expected JSON from ${finalUrl} but received Content-Type "${contentType}": ${rawText.slice(0, 150)}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err: any) {
    throw new Error(`Failed to parse JSON response from ${finalUrl}: ${err.message}`);
  }

  if (!res.ok) {
    const errorMessage = String(data?.error || data?.message || `Request failed with status ${res.status}`);
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; confirmPassword?: string; acceptTerms: boolean }) {
    const res = await fetchJson<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      localStorage.setItem('recruitai_token', res.token);
    }
    return res;
  },

  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    const res = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      localStorage.setItem('recruitai_token', res.token);
    }
    return res;
  },

  async getMe() {
    return fetchJson<{ user: User }>('/api/auth/me');
  },

  async logout() {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('recruitai_token');
    }
  },

  async forgotPassword(email: string) {
    return fetchJson<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Jobs
  async getJobs(params?: { search?: string; status?: string; department?: string; employmentType?: string; sortBy?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') searchParams.append(k, v);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<Job[]>(`/api/jobs${query}`);
  },

  async getJob(id: string) {
    return fetchJson<Job>(`/api/jobs/${id}`);
  },

  async createJob(jobData: Partial<Job>) {
    return fetchJson<Job>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  async updateJob(id: string, jobData: Partial<Job>) {
    return fetchJson<Job>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  },

  async updateJobStatus(id: string, status: string) {
    return fetchJson<Job>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteJob(id: string) {
    return fetchJson<{ success: boolean; message: string }>(`/api/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  // Candidates
  async getCandidates(params?: { search?: string; jobId?: string; experience?: string; status?: string; sortBy?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') searchParams.append(k, v);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<Candidate[]>(`/api/candidates${query}`);
  },

  async getCandidate(id: string) {
    return fetchJson<Candidate>(`/api/candidates/${id}`);
  },

  async createCandidate(candidateData: Partial<Candidate>) {
    return fetchJson<Candidate>('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData)
    });
  },

  async updateCandidate(id: string, candidateData: Partial<Candidate>) {
    return fetchJson<Candidate>(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData)
    });
  },

  async deleteCandidate(id: string) {
    return fetchJson<{ success: boolean; message: string }>(`/api/candidates/${id}`, {
      method: 'DELETE'
    });
  },

  async uploadResume(file: File, jobId?: string) {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobId) formData.append('jobId', jobId);

    return fetchJson<{ success: boolean; message: string; candidate: Candidate; matchAnalysis?: MatchAnalysis }>('/api/candidates/upload-resume', {
      method: 'POST',
      body: formData
    });
  },

  // Matching
  async analyzeMatching(jobId: string, candidateIds: string[]) {
    return fetchJson<{ success: boolean; count: number; jobId: string; jobTitle: string; results: MatchAnalysis[] }>(
      '/api/matching/analyze',
      {
        method: 'POST',
        body: JSON.stringify({ jobId, candidateIds })
      }
    );
  },

  async getMatches(jobId?: string) {
    const url = jobId ? `/api/matching/job/${jobId}` : '/api/matching';
    return fetchJson<MatchAnalysis[]>(url);
  },

  // Interviews
  async generateInterviewQuestions(data: {
    role: string;
    candidateId?: string;
    relatedJobId?: string;
    interviewType: string;
    difficulty: string;
    count: number;
    additionalInstructions?: string;
  }) {
    return fetchJson<{ success: boolean; questions: InterviewQuestion[] }>('/api/interviews/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getInterviewQuestions() {
    return fetchJson<InterviewQuestion[]>('/api/interviews');
  },

  async updateInterviewQuestion(id: string, data: Partial<InterviewQuestion>) {
    return fetchJson<InterviewQuestion>(`/api/interviews/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Dashboard
  async getDashboardStats() {
    return fetchJson<DashboardStats>('/api/dashboard/stats');
  },

  async getActivities(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return fetchJson<Activity[]>(`/api/dashboard/activities${query}`);
  },

  // AgentRouter AI Intelligence & Assistant
  async getAiStatus() {
    return fetchJson<{
      configured: boolean;
      provider: string;
      model: string;
      latencyMs?: number;
      status: string;
      error?: string;
    }>('/api/ai/status');
  },

  async askAiAssistant(data: {
    question: string;
    candidateId?: string;
    jobId?: string;
  }) {
    return fetchJson<{
      success: boolean;
      answer: string;
      model: string;
      suggestions?: string[];
      error?: string;
    }>('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
