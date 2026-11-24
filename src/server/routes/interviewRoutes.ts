import { Router } from 'express';
import { storage } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { generateQuestionsService } from '../aiServices.js';
import { QuestionCategory, QuestionDifficulty } from '../types.js';

const router = Router();
router.use(requireAuth);

// Generate questions (supports /generate, /generate/, and /)
router.post(['/generate', '/generate/', '/'], async (req: AuthenticatedRequest, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const userId = req.user!.id;
    const { role, candidateId, relatedJobId, interviewType, difficulty, count, additionalInstructions } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role is required.' });
    }

    const questionCount = Math.min(20, Math.max(1, Number(count) || 5));
    const cat = (interviewType as QuestionCategory) || 'Technical';
    const diff = (difficulty as QuestionDifficulty) || 'Intermediate';

    let candidate = undefined;
    if (candidateId) {
      candidate = storage.getCandidateById(userId, candidateId);
    }

    const generated = await generateQuestionsService(
      userId,
      role.trim(),
      relatedJobId || undefined,
      cat,
      diff,
      questionCount,
      additionalInstructions,
      candidate
    );

    storage.saveInterviewQuestions(userId, generated);

    return res.status(201).json({
      success: true,
      questions: generated
    });
  } catch (err: any) {
    console.error('Interview generation error:', err);
    return res.status(500).json({ error: err.message || 'Error generating interview questions.' });
  }
});

// List saved questions
router.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const questions = storage.getInterviews(userId);
    return res.json(questions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch interview questions.' });
  }
});

// Update single question
router.put('/questions/:id', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const updated = storage.updateInterviewQuestion(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Interview question not found.' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update interview question.' });
  }
});

export default router;
