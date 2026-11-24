import { Router } from 'express';
import { storage } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { EmploymentType, JobStatus } from '../types.js';

const router = Router();

router.use(requireAuth);

// List Jobs
router.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    let jobs = storage.getJobs(userId);

    const { search, status, department, employmentType, sortBy } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (status && typeof status === 'string' && status !== 'All') {
      jobs = jobs.filter(j => j.status === status);
    }

    if (department && typeof department === 'string' && department !== 'All') {
      jobs = jobs.filter(j => j.department === department);
    }

    if (employmentType && typeof employmentType === 'string' && employmentType !== 'All') {
      jobs = jobs.filter(j => j.employmentType === employmentType);
    }

    if (sortBy === 'title') {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'applicants') {
      jobs.sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0));
    } else {
      // Default: date descending
      jobs.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return res.json(jobs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch jobs' });
  }
});

// Get Single Job
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const job = storage.getJobById(userId, req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job requisition not found' });
  }
  return res.json(job);
});

// Create Job
router.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      department,
      location,
      employmentType,
      description,
      requiredSkills,
      preferredSkills,
      minExperience,
      educationRequirements,
      responsibilities,
      status
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Job title is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ error: 'Department is required.' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Location is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    const job = storage.createJob(userId, {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      employmentType: (employmentType as EmploymentType) || 'Full-time',
      status: (status as JobStatus) || 'Open',
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : [],
      minExperience: minExperience || '3+ years',
      educationRequirements: educationRequirements || 'Bachelor degree or equivalent',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : []
    });

    return res.status(201).json(job);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create job' });
  }
});

// Update Job
router.put('/:id', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const updated = storage.updateJob(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update job' });
  }
});

// Change Job Status
router.patch('/:id/status', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { status } = req.body;
    if (!['Open', 'Draft', 'Closed', 'In Review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const updated = storage.updateJob(userId, req.params.id, { status: status as JobStatus });
    if (!updated) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update job status' });
  }
});

// Delete Job
router.delete('/:id', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = storage.deleteJob(userId, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete job' });
  }
});

export default router;
