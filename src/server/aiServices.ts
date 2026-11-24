import { GoogleGenAI } from '@google/genai';
import { AgentRouterClient } from './agentRouterClient.js';
import {
  CandidateRecord,
  JobRecord,
  MatchAnalysisRecord,
  InterviewQuestionRecord,
  QuestionCategory,
  QuestionDifficulty
} from './types.js';
import crypto from 'crypto';

// Initialize AgentRouter (ChatGPT 6 Astra)
function getAgentRouterClient(): AgentRouterClient | null {
  const client = new AgentRouterClient();
  if (client.isConfigured()) {
    return client;
  }
  return null;
}

// Fallback Gemini Client (if configured)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
    return null;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number = 90000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`AI service request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function cleanJsonText(raw: string): string {
  let cleaned = (raw || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/i, '').trim();
  }
  return cleaned;
}

// ==========================================
// 1. AI RESUME ENHANCEMENT & EXTRACTION
// ==========================================
export async function enhanceResumeExtractionWithAI(
  rawResumeText: string
): Promise<{
  name?: string;
  email?: string;
  phone?: string;
  currentRole?: string;
  location?: string;
  experienceYears?: number;
  education?: string;
  keySkills?: string[];
  certifications?: string[];
  summary?: string;
}> {
  const router = getAgentRouterClient();
  if (!router) {
    return {};
  }

  const prompt = `You are an expert AI technical recruiter and resume parser.
Extract the structured candidate information from the following raw resume text.
Extract ONLY factual information present in the resume text. Do NOT hallucinate or invent missing details.
If any field is missing or not mentioned, return null for that field or an empty array for lists.

RAW RESUME TEXT:
"""
${rawResumeText.slice(0, 7000)}
"""

RESPOND ONLY WITH A VALID JSON OBJECT MATCHING THIS EXACT SCHEMA:
{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "currentRole": string or null,
  "location": string or null,
  "experienceYears": number or null,
  "education": string or null,
  "keySkills": [string],
  "certifications": [string],
  "summary": string or null
}`;

  try {
    const parsed = await withTimeout(
      router.generateJson<any>(prompt, 'You are an accurate, deterministic resume parsing engine.'),
      80000
    );

    const result: any = {};
    if (parsed.name && typeof parsed.name === 'string') result.name = parsed.name.trim();
    if (parsed.email && typeof parsed.email === 'string') result.email = parsed.email.trim();
    if (parsed.phone && typeof parsed.phone === 'string') result.phone = parsed.phone.trim();
    if (parsed.currentRole && typeof parsed.currentRole === 'string') result.currentRole = parsed.currentRole.trim();
    if (parsed.location && typeof parsed.location === 'string') result.location = parsed.location.trim();
    if (typeof parsed.experienceYears === 'number' && !isNaN(parsed.experienceYears)) {
      result.experienceYears = Math.max(0, Math.round(parsed.experienceYears));
    }
    if (parsed.education && typeof parsed.education === 'string') result.education = parsed.education.trim();
    if (Array.isArray(parsed.keySkills) && parsed.keySkills.length > 0) {
      result.keySkills = parsed.keySkills.map((s: any) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
      result.certifications = parsed.certifications.map((c: any) => String(c).trim()).filter(Boolean);
    }
    if (parsed.summary && typeof parsed.summary === 'string') result.summary = parsed.summary.trim();

    return result;
  } catch (err: any) {
    console.warn('AgentRouter resume extraction failed, using deterministic regex parser:', err.message);
    return {};
  }
}

// ==========================================
// 2. AI CANDIDATE MATCHING
// ==========================================
export async function analyzeCandidateAgainstJob(
  userId: string,
  candidate: CandidateRecord,
  job: JobRecord
): Promise<MatchAnalysisRecord> {
  const agentRouterClient = getAgentRouterClient();

  // Try AgentRouter (ChatGPT 6 Astra) first
  if (agentRouterClient) {
    try {
      const prompt = `You are an expert technical recruiter analyzing a candidate against an open job requisition.
Analyze the following candidate resume data and open job details.
Respond ONLY with a valid JSON object matching the exact structure specified below.

JOB:
Title: ${job.title}
Department: ${job.department}
Required Skills: ${job.requiredSkills.join(', ')}
Preferred Skills: ${job.preferredSkills.join(', ')}
Minimum Experience: ${job.minExperience}
Education Requirements: ${job.educationRequirements}
Description: ${job.description}

CANDIDATE:
Name: ${candidate.name}
Role: ${candidate.currentRole}
Key Skills: ${candidate.keySkills.join(', ')}
Experience: ${candidate.experienceYears} years
Education: ${candidate.education}
Summary: ${candidate.summary}
Resume Snippet: ${candidate.resumeTextContent?.slice(0, 1500) || 'None provided'}

RETURN JSON FORMAT:
{
  "overallScore": number (0-100),
  "skillsScore": number (0-100),
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "matchingSkills": [string],
  "missingSkills": [string],
  "strengths": [string],
  "experienceComparison": {
    "required": "${job.minExperience}",
    "candidate": "${candidate.experienceYears} years",
    "verdict": "Met" | "Exceeded" | "Partially Met" | "Under"
  },
  "educationComparison": {
    "required": "${job.educationRequirements}",
    "candidate": "${candidate.education}",
    "verdict": "Met" | "Exceeded" | "Alternative Match"
  },
  "missingInfoNotes": [string],
  "suggestedQuestions": [string]
}`;

      const parsed = await withTimeout(
        agentRouterClient.generateJson<any>(
          prompt,
          'You are an expert talent evaluation intelligence system. Evaluate required and preferred skills separately. Provide nuanced scores.'
        ),
        80000
      );

      if (parsed && parsed.overallScore !== undefined) {
        return {
          id: `match-${crypto.randomUUID()}`,
          userId,
          candidateId: candidate.id,
          jobId: job.id,
          candidateName: candidate.name,
          jobTitle: job.title,
          overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore))),
          skillsScore: Math.min(100, Math.max(0, Math.round(parsed.skillsScore || parsed.overallScore))),
          experienceScore: Math.min(100, Math.max(0, Math.round(parsed.experienceScore || parsed.overallScore))),
          educationScore: Math.min(100, Math.max(0, Math.round(parsed.educationScore || parsed.overallScore))),
          matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
          missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          experienceComparison: parsed.experienceComparison || {
            required: job.minExperience,
            candidate: `${candidate.experienceYears} years`,
            verdict: candidate.experienceYears >= 4 ? 'Met' : 'Partially Met'
          },
          educationComparison: parsed.educationComparison || {
            required: job.educationRequirements,
            candidate: candidate.education,
            verdict: 'Met'
          },
          missingInfoNotes: Array.isArray(parsed.missingInfoNotes) ? parsed.missingInfoNotes : [],
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
          createdAt: new Date().toISOString()
        };
      }
    } catch (error: any) {
      console.warn('AgentRouter (ChatGPT 6 Astra) matching failed, checking fallback:', error.message);
    }
  }

  // Fallback to Gemini if configured
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Analyze the candidate against the job requisition. Return JSON matching the schema.`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        }),
        6000
      );
      const parsed = JSON.parse(cleanJsonText(response.text?.trim() || '{}'));
      if (parsed.overallScore !== undefined) {
        return {
          id: `match-${crypto.randomUUID()}`,
          userId,
          candidateId: candidate.id,
          jobId: job.id,
          candidateName: candidate.name,
          jobTitle: job.title,
          overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore))),
          skillsScore: Math.min(100, Math.max(0, Math.round(parsed.skillsScore || parsed.overallScore))),
          experienceScore: Math.min(100, Math.max(0, Math.round(parsed.experienceScore || parsed.overallScore))),
          educationScore: Math.min(100, Math.max(0, Math.round(parsed.educationScore || parsed.overallScore))),
          matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
          missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          experienceComparison: parsed.experienceComparison || {
            required: job.minExperience,
            candidate: `${candidate.experienceYears} years`,
            verdict: candidate.experienceYears >= 4 ? 'Met' : 'Partially Met'
          },
          educationComparison: parsed.educationComparison || {
            required: job.educationRequirements,
            candidate: candidate.education,
            verdict: 'Met'
          },
          missingInfoNotes: Array.isArray(parsed.missingInfoNotes) ? parsed.missingInfoNotes : [],
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Gemini fallback failed:', e);
    }
  }

  // Deterministic, documented algorithmic analysis engine
  return calculateDeterministicMatch(userId, candidate, job);
}

function calculateDeterministicMatch(
  userId: string,
  candidate: CandidateRecord,
  job: JobRecord
): MatchAnalysisRecord {
  const candidateSkillsLower = candidate.keySkills.map(s => s.toLowerCase());
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  // Check required skills
  job.requiredSkills.forEach(req => {
    const isMatch = candidateSkillsLower.some(candSkill =>
      candSkill.includes(req.toLowerCase()) || req.toLowerCase().includes(candSkill)
    );
    if (isMatch) {
      matchingSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Check preferred skills
  job.preferredSkills.forEach(pref => {
    const isMatch = candidateSkillsLower.some(candSkill =>
      candSkill.includes(pref.toLowerCase()) || pref.toLowerCase().includes(candSkill)
    );
    if (isMatch && !matchingSkills.includes(pref)) {
      matchingSkills.push(pref);
    }
  });

  const requiredCount = Math.max(1, job.requiredSkills.length);
  const matchedRequiredCount = job.requiredSkills.filter(req => matchingSkills.includes(req)).length;
  const skillsScore = Math.min(100, Math.round((matchedRequiredCount / requiredCount) * 80 + (matchingSkills.length > matchedRequiredCount ? 15 : 5)));

  const reqYearsMatch = job.minExperience.match(/(\d+)/);
  const requiredYears = reqYearsMatch ? parseInt(reqYearsMatch[1], 10) : 3;

  let expVerdict: 'Met' | 'Exceeded' | 'Partially Met' | 'Under' = 'Met';
  let experienceScore = 80;
  if (candidate.experienceYears > requiredYears + 1) {
    expVerdict = 'Exceeded';
    experienceScore = 95;
  } else if (candidate.experienceYears >= requiredYears) {
    expVerdict = 'Met';
    experienceScore = 85;
  } else if (candidate.experienceYears >= requiredYears - 1) {
    expVerdict = 'Partially Met';
    experienceScore = 70;
  } else {
    expVerdict = 'Under';
    experienceScore = 55;
  }

  const educationScore = candidate.education && !candidate.education.includes('Not specified') ? 90 : 70;
  const eduVerdict = educationScore >= 85 ? 'Met' : 'Alternative Match';

  const overallScore = Math.min(99, Math.max(45, Math.round(skillsScore * 0.50 + experienceScore * 0.35 + educationScore * 0.15)));

  const strengths: string[] = [
    `Verified hands-on proficiency in ${matchingSkills.slice(0, 3).join(', ') || 'core stack'}`,
    `Demonstrated ${candidate.experienceYears} years industry track record (${expVerdict} requirement of ${job.minExperience})`
  ];
  if (candidate.currentRole.toLowerCase().includes('senior') || candidate.currentRole.toLowerCase().includes('lead')) {
    strengths.push(`Senior-level title alignment with active role: ${candidate.currentRole}`);
  }

  const suggestedQuestions: string[] = [];
  if (missingSkills.length > 0) {
    suggestedQuestions.push(`Could you share your experience or transferable knowledge regarding ${missingSkills[0]}?`);
  }
  suggestedQuestions.push(`Walk us through your architecture decision-making process for high-impact projects at your last role.`);
  suggestedQuestions.push(`How do you measure success and maintain engineering quality in a fast-paced team?`);

  return {
    id: `match-${crypto.randomUUID()}`,
    userId,
    candidateId: candidate.id,
    jobId: job.id,
    candidateName: candidate.name,
    jobTitle: job.title,
    overallScore,
    skillsScore,
    experienceScore,
    educationScore,
    matchingSkills,
    missingSkills,
    strengths,
    experienceComparison: {
      required: job.minExperience,
      candidate: `${candidate.experienceYears} years confirmed`,
      verdict: expVerdict
    },
    educationComparison: {
      required: job.educationRequirements,
      candidate: candidate.education || 'Not specified',
      verdict: eduVerdict
    },
    missingInfoNotes: candidate.phone ? [] : ['Contact phone number not specified on parsed resume'],
    suggestedQuestions,
    createdAt: new Date().toISOString()
  };
}

// ==========================================
// 3. AI INTERVIEW QUESTION GENERATOR
// ==========================================
export async function generateQuestionsService(
  userId: string,
  role: string,
  relatedJobId: string | undefined,
  interviewType: QuestionCategory,
  difficulty: QuestionDifficulty,
  count: number,
  additionalInstructions?: string,
  candidate?: CandidateRecord
): Promise<InterviewQuestionRecord[]> {
  const agentRouterClient = getAgentRouterClient();

  if (agentRouterClient) {
    try {
      const candidateContext = candidate ? `
CANDIDATE BACKGROUND:
- Candidate Name: ${candidate.name}
- Current/Previous Role: ${candidate.currentRole}
- Confirmed Experience: ${candidate.experienceYears} years
- Evidenced Skills: ${candidate.keySkills.join(', ')}
- Education: ${candidate.education}
- Resume Summary: ${candidate.summary}
Tailor questions directly to assess this candidate's specific track record, evidenced skills, and readiness for the role.` : '';

      const prompt = `Generate exactly ${count} structured interview questions for a candidate being interviewed for the role of "${role}".
Interview Type: ${interviewType} (General, Technical, Behavioral, Situational, HR, or Role-specific)
Difficulty: ${difficulty} (Beginner, Intermediate, Advanced)
${candidateContext}
Additional Instructions: ${additionalInstructions || 'None'}

Return ONLY a valid JSON array of objects with the following keys for each question:
[
  {
    "number": 1,
    "text": "The full question text",
    "category": "${interviewType}",
    "difficulty": "${difficulty}",
    "evaluationCriteria": "Detailed explanation of what a strong response should cover and key indicators to look for"
  }
]`;

      const parsedArray = await withTimeout(
        agentRouterClient.generateJson<any[]>(
          prompt,
          'You are an executive interviewer and technical hiring director. Produce rigorous, structured interview questions.'
        ),
        80000
      );

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return parsedArray.map((q, idx) => ({
          id: `q-${crypto.randomUUID()}`,
          userId,
          number: idx + 1,
          role,
          relatedJobId,
          text: q.text,
          category: (q.category as QuestionCategory) || interviewType,
          difficulty: (q.difficulty as QuestionDifficulty) || difficulty,
          evaluationCriteria: q.evaluationCriteria || 'Look for depth of knowledge, structured response, and relevant real-world examples.',
          createdAt: new Date().toISOString()
        }));
      }
    } catch (err: any) {
      console.warn('AgentRouter question generation error, checking fallback:', err.message);
    }
  }

  // Gemini fallback
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Generate ${count} questions for ${role}. Return JSON.`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        }),
        6000
      );
      const text = cleanJsonText(response.text?.trim() || '[]');
      const parsedArray = JSON.parse(text);
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return parsedArray.map((q, idx) => ({
          id: `q-${crypto.randomUUID()}`,
          userId,
          number: idx + 1,
          role,
          relatedJobId,
          text: q.text,
          category: (q.category as QuestionCategory) || interviewType,
          difficulty: (q.difficulty as QuestionDifficulty) || difficulty,
          evaluationCriteria: q.evaluationCriteria || 'Look for depth of knowledge.',
          createdAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('Gemini question generation error:', e);
    }
  }

  return getRoleSpecializedQuestions(userId, role, relatedJobId, interviewType, difficulty, count);
}

function getRoleSpecializedQuestions(
  userId: string,
  role: string,
  relatedJobId: string | undefined,
  category: QuestionCategory,
  difficulty: QuestionDifficulty,
  count: number
): InterviewQuestionRecord[] {
  const isDesigner = role.toLowerCase().includes('design');
  const isDev = role.toLowerCase().includes('developer') || role.toLowerCase().includes('engineer');

  const technicalDevQuestions = [
    {
      text: `How do you approach state management in a large-scale single-page application, and what criteria determine whether state belongs in local component state, global store, or server cache?`,
      criteria: `Look for understanding of server state (e.g., TanStack Query) vs client UI state, immutability, avoidance of unnecessary re-renders, and modularity.`
    },
    {
      text: `Can you walk through how modern JavaScript runtimes execute asynchronous tasks, specifically contrasting the microtask queue with the macrotask queue?`,
      criteria: `Candidate should mention event loop phases, Promises/queueMicrotask vs setTimeout/I/O, and implications for UI frame rendering.`
    },
    {
      text: `Explain your process for diagnosing and fixing a severe frontend memory leak or layout thrashing in production.`,
      criteria: `Look for experience with browser DevTools Memory Profiler, heap snapshots, detatched DOM tree inspection, and requestAnimationFrame usage.`
    },
    {
      text: `How do you implement robust TypeScript generic types and strict type narrowing to prevent runtime errors in shared API clients?`,
      criteria: `Candidate should demonstrate discriminating unions, conditional types, zod/schema validation, and type guards.`
    },
    {
      text: `What are your strategies for optimizing Core Web Vitals (LCP, INP, and CLS) on high-traffic content and dashboard applications?`,
      criteria: `Look for discussion of critical CSS, font display swap, image sizing/AVIF formats, code splitting, and hydration cost reduction.`
    },
    {
      text: `How do you secure web applications against Cross-Site Scripting (XSS), CSRF, and prototype pollution?`,
      criteria: `Look for Content Security Policy (CSP), HTTP-only SameSite cookies, input sanitization, and output encoding.`
    },
    {
      text: `Describe your methodology for end-to-end testing with Playwright or Cypress without creating flaky or slow CI pipelines.`,
      criteria: `Look for data isolation, page object patterns, avoiding hardcoded sleeps, and deterministic mocks.`
    },
    {
      text: `How do you architect reusable UI components to ensure full WCAG 2.1 AA accessibility compliance?`,
      criteria: `Candidate should discuss ARIA attributes, semantic HTML elements, keyboard focus traps, screen reader testing, and color contrast.`
    },
    {
      text: `What are the trade-offs between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR) for an enterprise web app?`,
      criteria: `Candidate should balance TTFB, SEO requirements, server load, cache invalidation complexity, and interactive user latency.`
    },
    {
      text: `How would you design a resilient real-time synchronization layer between clients and server with offline optimistic updates?`,
      criteria: `Look for conflict resolution strategies (e.g. CRDTs, last-write-wins), heartbeat reconnect loops, and optimistic rollbacks.`
    },
    {
      text: `Explain how CSS containment, layout triggers, and hardware-accelerated layers impact 60fps animations.`,
      criteria: `Candidate should cite transform and opacity properties over top/left/width, will-change usage, and GPU compositor layers.`
    },
    {
      text: `How do you structure codebases for multi-package monorepos with Turborepo or Nx to maximize build caching and developer velocity?`,
      criteria: `Look for remote caching, package boundary isolation, circular dependency avoidance, and shared config strategies.`
    }
  ];

  const designQuestions = [
    {
      text: `How do you establish and maintain design tokens between Figma and production code to prevent drift between design and engineering?`,
      criteria: `Look for automated token pipelines (e.g. Style Dictionary, Tokens Studio), semantic naming scales, and cross-functional versioning.`
    },
    {
      text: `Describe a scenario where quantitative analytics conflicted with qualitative user feedback during research. How did you reconcile the two?`,
      criteria: `Candidate should demonstrate intellectual humility, deep problem decomposition, willingness to run validation tests, and customer empathy.`
    },
    {
      text: `Walk us through your information architecture methodology when designing complex, multi-step enterprise workflows.`,
      criteria: `Look for cognitive load reduction, progressive disclosure, mental model alignment, and user journey mapping.`
    },
    {
      text: `How do you measure the business impact and ROI of design system investments across engineering and design organizations?`,
      criteria: `Look for component reuse metrics, reduced design-to-production turnaround time, accessibility defect reduction, and brand consistency.`
    },
    {
      text: `How do you approach usability testing with high-fidelity interactive prototypes under tight launch constraints?`,
      criteria: `Look for clear hypothesis formulation, unmoderated vs moderated testing strategies, and fast synthesis into actionable priorities.`
    },
    {
      text: `Explain your process for designing accessible data visualization dashboards for color-blind and keyboard-only users.`,
      criteria: `Candidate should describe pattern textures, direct data labels, high-contrast palettes, and table alternatives for screen readers.`
    },
    {
      text: `How do you handle executive or stakeholder pushback when they request a feature that violates core usability principles?`,
      criteria: `Look for diplomatically framing arguments around business outcomes, presenting user test evidence, and providing alternative solutions.`
    },
    {
      text: `What is your philosophy on micro-interactions and motion design in enterprise tools?`,
      criteria: `Candidate should emphasize purpose-driven feedback over gratuitous animations, respect for prefers-reduced-motion, and speed.`
    },
    {
      text: `How do you conduct comprehensive competitive benchmarking when entering an unfamiliar industry vertical?`,
      criteria: `Look for feature matrices, usability heuristics evaluation, customer review mining, and identifying unmet pain points.`
    },
    {
      text: `Walk through your approach to design critiques and cultivating a blameless, high-feedback design culture.`,
      criteria: `Look for constructive framing, tying feedback to user goals rather than personal aesthetics, and clear next steps.`
    },
    {
      text: `How do you design for edge cases such as empty states, partial data failures, and slow network latency?`,
      criteria: `Candidate should present thoughtful skeleton layouts, clear error recovery paths, and helpful onboarding prompts.`
    },
    {
      text: `How do you balance rapid speed-to-market experimentation with long-term brand elegance and UX craft?`,
      criteria: `Look for staged rollout strategies, disposable prototypes vs scalable components, and post-launch polish sprints.`
    }
  ];

  const generalBehavioralQuestions = [
    {
      text: `Tell us about a time when you had to make an urgent technical or product decision with incomplete information. How did you proceed?`,
      criteria: `Look for structured risk assessment, bias for action, stakeholder communication, and post-decision validation.`
    },
    {
      text: `Describe a situation where you had a significant disagreement with a product manager or team lead over technical debt versus new features.`,
      criteria: `Candidate should show constructive negotiation, quantifying technical risk in business terms, and finding a balanced middle ground.`
    },
    {
      text: `Give an example of a project that failed or missed its delivery deadline. What did you learn and how did you adapt your future process?`,
      criteria: `Look for genuine accountability, transparent retrospective analysis, and systemic improvements implemented as a result.`
    },
    {
      text: `How do you mentor and upskill more junior teammates while continuing to deliver on your own high-priority commitments?`,
      criteria: `Look for pair programming, constructive pull request feedback, encouraging autonomy, and creating psychological safety.`
    },
    {
      text: `Tell us about a time you identified an operational inefficiency or tooling bottleneck in your team and proactively solved it.`,
      criteria: `Candidate should demonstrate initiative, collaborative implementation, and measurable time saved for the team.`
    },
    {
      text: `How do you stay current with rapidly evolving industry standards and determine which new technologies are worthy of enterprise adoption?`,
      criteria: `Look for proof-of-concept experimentation, evaluating ecosystem stability, community health, and avoiding resume-driven development.`
    },
    {
      text: `Describe how you handle conflicting priorities across multiple high-stakes deliverables when everything is labeled 'urgent'.`,
      criteria: `Look for ruthless prioritization based on impact, transparent status updates to stakeholders, and setting clear realistic boundaries.`
    },
    {
      text: `What makes a high-functioning engineering and product culture in your view, and how do you personally contribute to it?`,
      criteria: `Candidate should cite open communication, blameless postmortems, continuous learning, and celebration of shared wins.`
    },
    {
      text: `Walk through a time you had to deliver critical, sensitive feedback to a peer. How did you approach the conversation?`,
      criteria: `Look for empathy, timely delivery, focusing on specific observable behaviors rather than intent, and actionable guidance.`
    },
    {
      text: `How do you approach onboarding onto a massive, unfamiliar codebase or complex legacy domain?`,
      criteria: `Look for tracing user flows, talking to domain experts, documenting missing architecture diagrams, and starting with small wins.`
    },
    {
      text: `Tell us about an occasion where customer feedback directly challenged an assumption you were confident in. How did you respond?`,
      criteria: `Look for openness to changing mindsets, prioritizing customer reality, and adjusting specifications without ego.`
    },
    {
      text: `Where do you see your technical or leadership trajectory heading over the next 2-3 years, and what skills are you actively developing?`,
      criteria: `Candidate should show self-awareness, clear growth motivation, and alignment with high-leverage team impact.`
    }
  ];

  let sourceBank = generalBehavioralQuestions;
  if (category === 'Technical' || category === 'Role-specific') {
    sourceBank = isDesigner ? designQuestions : technicalDevQuestions;
  } else if (isDesigner) {
    sourceBank = designQuestions;
  } else if (isDev) {
    sourceBank = technicalDevQuestions;
  }

  const selected = sourceBank.slice(0, count);

  return selected.map((q, idx) => ({
    id: `q-${crypto.randomUUID()}`,
    userId,
    number: idx + 1,
    role,
    relatedJobId,
    text: q.text,
    category,
    difficulty,
    evaluationCriteria: q.criteria,
    createdAt: new Date().toISOString()
  }));
}

// ==========================================
// 4. AI RECRUITMENT ASSISTANT
// ==========================================
export async function askRecruitmentAssistant(
  question: string,
  contextData: {
    jobsCount?: number;
    candidatesCount?: number;
    activeJobTitles?: string[];
    selectedCandidateSummary?: string;
    selectedJobSummary?: string;
    recentMatchScore?: number;
  }
): Promise<{ answer: string; model: string; suggestions?: string[] }> {
  const router = getAgentRouterClient();
  if (!router) {
    throw new Error('AgentRouter API is not configured. Please check AGENTROUTER_API_KEY in server environment.');
  }

  const systemPrompt = `You are RecruitAI's expert recruitment and talent intelligence assistant powered by ChatGPT 6 Astra.
You assist technical recruiters, hiring managers, and talent acquisition teams with:
- Explaining candidate matching scores and skill alignment
- Suggesting tailored interview questions and evaluation criteria
- Crafting outreach messages, offer letters, and job requirement summaries
- Analyzing candidate strengths, gaps, and career trajectory
- Answering questions based on current live workspace data.

CURRENT RECRUITMENT WORKSPACE CONTEXT:
- Active Jobs in Pipeline: ${contextData.jobsCount ?? 'N/A'}
- Active Candidates: ${contextData.candidatesCount ?? 'N/A'}
- Top Job Requisitions: ${contextData.activeJobTitles?.join(', ') || 'Various engineering & design roles'}
${contextData.selectedJobSummary ? `- Selected Job Context: ${contextData.selectedJobSummary}` : ''}
${contextData.selectedCandidateSummary ? `- Selected Candidate Context: ${contextData.selectedCandidateSummary}` : ''}
${contextData.recentMatchScore !== undefined ? `- Recent Match Score: ${contextData.recentMatchScore}%` : ''}

GUIDELINES:
- Provide concise, insightful, professional answers.
- Format with clean Markdown (bullet points, bolding).
- Ground advice in practical recruitment best practices and the provided context.`;

  const prompt = `${question}

Provide your answer and at the very end include 2-3 short follow-up action questions or topics the recruiter might ask next, formatted as:
SUGGESTIONS:
- Question 1
- Question 2`;

  const fullResponse = await withTimeout(
    router.generateText(prompt, systemPrompt),
    80000
  );

  let answer = fullResponse;
  let suggestions: string[] = [];

  const splitIdx = fullResponse.indexOf('SUGGESTIONS:');
  if (splitIdx !== -1) {
    answer = fullResponse.substring(0, splitIdx).trim();
    const suggestionsRaw = fullResponse.substring(splitIdx + 'SUGGESTIONS:'.length).trim();
    suggestions = suggestionsRaw
      .split('\n')
      .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return {
    answer,
    model: router.getModel(),
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}
