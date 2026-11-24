import { Router } from 'express';
import { storage } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = storage.getDashboardStats(userId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard stats' });
  }
});

router.get('/activities', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const activities = storage.getActivities(userId, limit);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch activities' });
  }
});

router.get('/overview', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = storage.getDashboardStats(userId);
    const jobs = storage.getJobs(userId).slice(0, 5);
    const candidates = storage.getCandidates(userId).slice(0, 5);
    const activities = storage.getActivities(userId, 8);
    const matches = storage.getMatches(userId);

    res.json({
      stats,
      recentJobs: jobs,
      recentCandidates: candidates,
      activities,
      matchesSummary: {
        totalMatches: matches.length,
        averageScore: stats.averageMatchScore,
        scoreBuckets: stats.distribution
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load dashboard overview' });
  }
});

export default router;
