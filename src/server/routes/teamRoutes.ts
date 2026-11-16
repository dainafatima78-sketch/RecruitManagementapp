import { Router, Request, Response } from 'express';
import {
  generateTeamNames,
  ADJECTIVES,
  NOUNS,
  VIBE_METADATA,
  VibeType,
  PatternOption,
  CasingOption
} from '../../services/teamGenerator';

const router = Router();

// GET /api/team/wordbanks - Returns all wordbanks and metadata
router.get('/wordbanks', (_req: Request, res: Response) => {
  res.json({
    adjectives: ADJECTIVES,
    nouns: NOUNS,
    vibes: VIBE_METADATA,
    totalAdjectives: Object.values(ADJECTIVES).reduce((sum, arr) => sum + arr.length, 0),
    totalNouns: Object.values(NOUNS).reduce((sum, arr) => sum + arr.length, 0)
  });
});

// POST /api/team/generate - Generates team names using the core algorithm
router.post('/generate', (req: Request, res: Response) => {
  try {
    const {
      vibe = 'Tech',
      keyword = '',
      count = 3,
      patternMode = 'auto',
      casing = 'title'
    } = req.body;

    const validVibes = ['Tech', 'Creative', 'Business / Professional', 'Bold & Fierce', 'All'];
    if (!validVibes.includes(vibe)) {
      return res.status(400).json({ error: `Invalid vibe: ${vibe}` });
    }

    const safeCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 24);

    const concepts = generateTeamNames({
      vibe: vibe as VibeType | 'All',
      keyword: typeof keyword === 'string' ? keyword : '',
      count: safeCount,
      patternMode: patternMode as PatternOption,
      casing: casing as CasingOption
    });

    return res.json({
      success: true,
      count: concepts.length,
      vibe,
      keyword: keyword || null,
      names: concepts
    });
  } catch (error: any) {
    console.error('Error generating team names:', error);
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

export default router;

