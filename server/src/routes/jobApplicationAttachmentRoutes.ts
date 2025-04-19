import express from 'express';
import {
  getJobApplicationAttachments,
  uploadAttachment,
  getAttachmentById,
  deleteAttachment,
  updateAttachment,
  upload
} from '../controllers/jobApplicationAttachmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all attachments for a specific job application
router.get('/application/:jobApplicationId', getJobApplicationAttachments);

// Upload a new attachment for a job application
router.post('/application/:jobApplicationId/upload', upload.single('file'), uploadAttachment);

// Get a specific attachment by ID
router.get('/:id', getAttachmentById);

// Update attachment details
router.put('/:id', updateAttachment);

// Delete an attachment
router.delete('/:id', deleteAttachment);

export default router; 