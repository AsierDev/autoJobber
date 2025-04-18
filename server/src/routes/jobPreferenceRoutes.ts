import express from 'express';
import {
  createJobPreference,
  getActiveJobPreference,
  getUserJobPreferences,
  updateJobPreference,
  deleteJobPreference,
  setJobPreferenceActive,
} from '../controllers/jobPreferenceController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all job preference routes
router.use(authenticate);

// Create a new job preference
router.post('/', createJobPreference);

// Get active job preference
router.get('/active', getActiveJobPreference);

// Get all user's job preferences
router.get('/', getUserJobPreferences);

// Update a job preference
router.put('/:id', updateJobPreference);

// Delete a job preference
router.delete('/:id', deleteJobPreference);

// Set a job preference as active
router.put('/:id/active', setJobPreferenceActive);

export default router; 