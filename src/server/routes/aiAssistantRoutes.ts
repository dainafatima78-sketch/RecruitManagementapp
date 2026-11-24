import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { storage } from '../storage.js';
import { askRecruitmentAssistant } from '../aiServices.js';
import { agentRouter } from '../agentRouterClient.js';

const router = Router();
router.use(requireAuth);

// GET /api/ai/status - Check AgentRouter connection and model status
router.get('/status', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const isConfigured = agentRouter.isConfigured();
    if (!isConfigured) {
      return res.json({
        configured: false,
        provider: 'AgentRouter',
        model: 'gpt-6-astra',
        status: 'API key not configured in backend environment.'
      });
    }

    const test = await agentRouter.testConnection();
    return res.json({
      configured: true,
      provider: 'AgentRouter (agentrouter.org)',
      model: test.model,
      latencyMs: test.latencyMs,
      status: 'Connected & Operational'
    });
  } catch (err: any) {
    return res.status(500).json({
      configured: false,
      provider: 'AgentRouter',
      error: err.message || 'Connection test failed',
      status: 'Error communicating with AgentRouter'
    });
  }
});

// POST /api/ai/assistant - Interactive Recruitment Intelligence Assistant
router.post('/assistant', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { question, candidateId, jobId } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required for AI assistant.' });
    }

    // Assemble authentic workspace context for this user
    const jobs = storage.getJobs(userId);
    const candidates = storage.getCandidates(userId);

    let selectedCandidateSummary = undefined;
    if (candidateId) {
      const cand = storage.getCandidateById(userId, candidateId);
      if (cand) {
        selectedCandidateSummary = `Candidate ${cand.name} (${cand.currentRole}, ${cand.experienceYears}y exp, Skills: ${cand.keySkills.join(', ')})`;
      }
    }

    let selectedJobSummary = undefined;
    if (jobId) {
      const job = storage.getJobById(userId, jobId);
      if (job) {
        selectedJobSummary = `Job: ${job.title} (${job.department}, Req: ${job.requiredSkills.join(', ')}, Exp: ${job.minExperience})`;
      }
    }

    let recentMatchScore = undefined;
    if (candidateId && jobId) {
      const matches = storage.getMatches(userId, jobId);
      const match = matches.find(m => m.candidateId === candidateId);
      if (match) {
        recentMatchScore = match.overallScore;
      }
    }

    const response = await askRecruitmentAssistant(question.trim(), {
      jobsCount: jobs.length,
      candidatesCount: candidates.length,
      activeJobTitles: jobs.map(j => j.title),
      selectedCandidateSummary,
      selectedJobSummary,
      recentMatchScore
    });

    return res.json({
      success: true,
      answer: response.answer,
      model: response.model,
      suggestions: response.suggestions
    });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI assistant inquiry.'
    });
  }
});

export default router;

