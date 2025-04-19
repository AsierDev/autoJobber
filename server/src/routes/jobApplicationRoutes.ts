import express from 'express';
import {
  getAllJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getJobApplicationStats,
  updateApplicationFeedback,
  updateFollowUpDate
} from '../controllers/jobApplicationController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all job applications for a user
router.get('/', getAllJobApplications);

// Get job application statistics
router.get('/stats', getJobApplicationStats);

// Get a specific job application by ID
router.get('/:id', getJobApplicationById);

// Create a new job application
router.post('/', createJobApplication);

// Update an existing job application
router.put('/:id', updateJobApplication);

// Delete a job application
router.delete('/:id', deleteJobApplication);

// Update feedback for a job application
router.put('/:id/feedback', updateApplicationFeedback);

// Update follow-up date for a job application
router.put('/:id/followup', updateFollowUpDate);

export default router; 