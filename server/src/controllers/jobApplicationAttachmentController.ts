import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import JobApplicationAttachment from '../models/JobApplicationAttachment';
import JobApplication from '../models/JobApplication';

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/attachments');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid conflicts
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter to restrict certain file types if needed
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Add file type restrictions if needed
  // For example, only allow specific document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, text, and image files are allowed.'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get all attachments for a specific job application
export const getJobApplicationAttachments = async (req: Request, res: Response) => {
  try {
    const { jobApplicationId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the job application exists and belongs to the user
    const jobApplication = await JobApplication.findOne({
      where: {
        id: jobApplicationId,
        userId,
      },
    });

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    const attachments = await JobApplicationAttachment.findAll({
      where: {
        jobApplicationId,
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(attachments);
  } catch (error) {
    console.error('Error fetching job application attachments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Upload a new attachment for a job application
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const { jobApplicationId } = req.params;
    const { attachmentType, description } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the job application exists and belongs to the user
    const jobApplication = await JobApplication.findOne({
      where: {
        id: jobApplicationId,
        userId,
      },
    });

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create a new attachment record
    const fileUrl = `/uploads/attachments/${req.file.filename}`;
    
    const newAttachment = await JobApplicationAttachment.create({
      id: uuidv4(),
      jobApplicationId,
      userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl,
      description: description || null,
      attachmentType: attachmentType || 'other',
    });

    return res.status(201).json(newAttachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific attachment by ID
export const getAttachmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const attachment = await JobApplicationAttachment.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    return res.status(200).json(attachment);
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete an attachment
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const attachment = await JobApplicationAttachment.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '../..', attachment.fileUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.destroy();

    return res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update attachment details
export const updateAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, attachmentType } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const attachment = await JobApplicationAttachment.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    await attachment.update({
      ...(description !== undefined && { description }),
      ...(attachmentType && { attachmentType }),
    });

    return res.status(200).json(attachment);
  } catch (error) {
    console.error('Error updating attachment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 