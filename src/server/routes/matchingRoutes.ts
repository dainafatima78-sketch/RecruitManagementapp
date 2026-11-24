import { Router } from 'express';
import { storage } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { analyzeCandidateAgainstJob } from '../aiServices.js';

const router = Router();
router.use(requireAuth);

// Analyze selected candidates against a job (supports /analyze, /analyze/, and /)
router.post(['/analyze', '/analyze/', '/'], async (req: AuthenticatedRequest, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const userId = req.user!.id;
    const { jobId, candidateIds } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Please select a job requisition for matching analysis.' });
    }
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one candidate to analyze.' });
    }

    const job = storage.getJobById(userId, jobId);
    if (!job) {
      return res.status(404).json({ error: 'Selected job requisition not found.' });
    }

    const results = [];
    for (const candId of candidateIds) {
      const candidate = storage.getCandidateById(userId, candId);
      if (candidate) {
        const analysis = await analyzeCandidateAgainstJob(userId, candidate, job);
        storage.saveMatchAnalysis(analysis);
        results.push(analysis);
      }
    }

    return res.json({
      success: true,
      count: results.length,
      jobId,
      jobTitle: job.title,
      results
    });
  } catch (err: any) {
    console.error('Matching analysis error:', err);
    return res.status(500).json({ error: err.message || 'Error running match analysis.' });
  }
});

// Get match analyses for a job
router.get('/job/:jobId', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const matches = storage.getMatches(userId, req.params.jobId);
    return res.json(matches);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch match analyses.' });
  }
});

// Get all match analyses
router.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const matches = storage.getMatches(userId);
    return res.json(matches);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch match analyses.' });
  }
});

export default router;
