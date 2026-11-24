import { Router } from 'express';
import multer from 'multer';
import { storage } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { parseResumeBuffer } from '../resumeParser.js';
import { CandidateStatus } from '../types.js';
import { analyzeCandidateAgainstJob, enhanceResumeExtractionWithAI } from '../aiServices.js';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.use(requireAuth);

// List Candidates
router.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    let candidates = storage.getCandidates(userId);

    const { search, jobId, experience, status, sortBy } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      candidates = candidates.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.keySkills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (jobId && typeof jobId === 'string' && jobId !== 'All') {
      candidates = candidates.filter(c => c.associatedJobId === jobId);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      candidates = candidates.filter(c => c.status === status);
    }

    if (experience && typeof experience === 'string' && experience !== 'All') {
      if (experience === '0-2') {
        candidates = candidates.filter(c => c.experienceYears <= 2);
      } else if (experience === '3-5') {
        candidates = candidates.filter(c => c.experienceYears >= 3 && c.experienceYears <= 5);
      } else if (experience === '5+') {
        candidates = candidates.filter(c => c.experienceYears >= 5);
      }
    }

    if (sortBy === 'name') {
      candidates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'score') {
      candidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else {
      // Default: date added descending
      candidates.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }

    return res.json(candidates);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch candidates' });
  }
});

// Get Candidate Details
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const candidate = storage.getCandidateById(userId, req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate profile not found' });
  }
  return res.json(candidate);
});

// Create Candidate Manually
router.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      email,
      phone,
      location,
      currentRole,
      keySkills,
      experienceYears,
      education,
      associatedJobId,
      status,
      summary
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Candidate name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Candidate email is required.' });
    }

    let jobTitle = 'Unassigned';
    if (associatedJobId) {
      const job = storage.getJobById(userId, associatedJobId);
      if (job) {
        jobTitle = job.title;
      }
    }

    const candidate = storage.createCandidate(userId, {
      name: name.trim(),
      email: email.trim(),
      phone: phone || undefined,
      location: location || undefined,
      currentRole: currentRole || 'Software Professional',
      keySkills: Array.isArray(keySkills) ? keySkills : [],
      experienceYears: Number(experienceYears) || 0,
      education: education || 'Not specified',
      associatedJobId: associatedJobId || undefined,
      associatedJobTitle: jobTitle,
      matchScore: 0,
      status: (status as CandidateStatus) || 'New',
      summary: summary || ''
    });

    return res.status(201).json(candidate);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create candidate' });
  }
});

// Update Candidate
router.put('/:id', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const updated = storage.updateCandidate(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update candidate' });
  }
});

// Delete Candidate
router.delete('/:id', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = storage.deleteCandidate(userId, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    return res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete candidate' });
  }
});

// Upload and Parse Resume (PDF & DOCX)
router.post('/upload-resume', upload.single('resume'), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const associatedJobId = req.body.jobId;

    if (!file) {
      return res.status(400).json({ error: 'No resume file provided for upload.' });
    }

    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream',
      'text/plain'
    ];
    const allowedExts = ['pdf', 'docx', 'doc', 'txt'];
    const fileExt = file.originalname.split('.').pop()?.toLowerCase() || '';

    if (!allowedExts.includes(fileExt) && !allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt).'
      });
    }

    // Process file with resume parser
    const { rawText, parsed } = await parseResumeBuffer(file.buffer, file.originalname, file.mimetype);

    // AI Enhancement via AgentRouter (ChatGPT 6 Astra)
    let aiExtracted: any = {};
    if (rawText && rawText.trim().length > 30) {
      try {
        aiExtracted = await enhanceResumeExtractionWithAI(rawText);
      } catch (aiParseErr) {
        console.warn('AI Resume extraction enhancement error:', aiParseErr);
      }
    }

    // Merge deterministic parser with AI findings (preferring AI for clean naming & role, retaining parsed details)
    const finalName = aiExtracted.name || parsed.name || 'Candidate';
    const finalEmail = aiExtracted.email || parsed.email || `applicant.${Date.now()}@domain.com`;
    const finalPhone = aiExtracted.phone || parsed.phone;
    const finalLocation = aiExtracted.location || parsed.location || 'Not specified';
    const finalRole = aiExtracted.currentRole || parsed.currentRole || 'Software Professional';
    const finalExperience = aiExtracted.experienceYears !== undefined ? aiExtracted.experienceYears : (parsed.experienceYears || 2);
    const finalEducation = aiExtracted.education || parsed.education || 'Not specified';
    const finalSkills = Array.from(new Set([
      ...(aiExtracted.keySkills || []),
      ...(parsed.keySkills || [])
    ]));
    const finalCerts = Array.from(new Set([
      ...(aiExtracted.certifications || []),
      ...(parsed.certifications || [])
    ]));
    const finalSummary = aiExtracted.summary || parsed.summary || 'Uploaded via Resume Parsing pipeline.';

    // Identify target job requisition for AI matching
    let targetJob = associatedJobId ? storage.getJobById(userId, associatedJobId) : undefined;
    if (!targetJob) {
      const openJobs = storage.getJobs(userId).filter(j => j.status === 'Open');
      if (openJobs.length === 1) {
        targetJob = openJobs[0];
      }
    }

    const jobTitle = targetJob ? targetJob.title : 'Unassigned';
    const finalJobId = targetJob ? targetJob.id : (associatedJobId || undefined);

    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // Create candidate in database
    const newCandidate = storage.createCandidate(userId, {
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      location: finalLocation,
      currentRole: finalRole,
      keySkills: finalSkills.length > 0 ? finalSkills : ['Software Engineering'],
      experienceYears: finalExperience,
      education: finalEducation,
      educationDetails: parsed.educationDetails,
      workHistory: parsed.workHistory,
      certifications: finalCerts,
      associatedJobId: finalJobId,
      associatedJobTitle: jobTitle,
      matchScore: 0,
      status: 'New',
      summary: finalSummary,
      resumeFileName: file.originalname,
      resumeFileSize: fileSizeFormatted,
      resumeTextContent: rawText.slice(0, 5000)
    });

    // Automatically run AI matching if target job is assigned
    let matchAnalysis = null;
    if (targetJob) {
      try {
        matchAnalysis = await analyzeCandidateAgainstJob(userId, newCandidate, targetJob);
        storage.saveMatchAnalysis(matchAnalysis);
      } catch (matchErr) {
        console.warn('Auto match analysis error during upload:', matchErr);
      }
    }

    const finalCandidate = storage.getCandidateById(userId, newCandidate.id) || newCandidate;

    return res.status(201).json({
      success: true,
      message: matchAnalysis && targetJob
        ? `Resume parsed and candidate matched against ${targetJob.title} (${matchAnalysis.overallScore}% score).`
        : 'Resume parsed and candidate profile created successfully.',
      candidate: finalCandidate,
      matchAnalysis: matchAnalysis || undefined
    });
  } catch (err: any) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ error: err.message || 'Error processing resume file.' });
  }
});

export default router;
