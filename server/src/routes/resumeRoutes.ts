import express from 'express';
import {
  uploadResume,
  getActiveResume,
  getUserResumes,
  deleteResume,
  setResumeActive,
  upload,
} from '../controllers/resumeController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all resume routes
router.use(authenticate);

// Upload a new resume
router.post('/upload', upload.single('file'), uploadResume);

// Get active resume
router.get('/active', getActiveResume);

// Get all user's resumes
router.get('/', getUserResumes);

// Delete a resume
router.delete('/:id', deleteResume);

// Set a resume as active
router.put('/:id/active', setResumeActive);

export default router; 