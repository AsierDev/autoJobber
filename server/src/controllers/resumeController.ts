import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import Resume from '../models/Resume';
import axios from 'axios';
import multer from 'multer';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// Configure multer for file uploads
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and DOCX files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// Upload resume
export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const file = req.file;
    const filePath = file.path;
    const fileType = file.mimetype;
    const fileSize = file.size;
    const originalFilename = file.originalname;
    const s3Key = `resumes/${userId}/${path.basename(filePath)}`;

    // Upload file to S3
    const fileContent = fs.readFileSync(filePath);
    const s3Result = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET || 'autojobber',
      Key: s3Key,
      Body: fileContent,
      ContentType: fileType,
      ACL: 'private',
    }).promise();

    // Clean up local file
    fs.unlinkSync(filePath);

    // Parse resume using AI service
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: fileType }), originalFilename);

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const parseResponse = await axios.post(`${aiServiceUrl}/parse-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const parsedData = parseResponse.data;

    // Check if user already has an active resume
    const existingResume = await Resume.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingResume) {
      // Set existing resume as inactive
      await existingResume.update({ isActive: false });
    }

    // Create new resume record
    const resume = await Resume.create({
      userId,
      filename: path.basename(filePath),
      originalFilename,
      fileUrl: s3Result.Location,
      fileType,
      fileSize,
      isActive: true,
      parsedData,
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume.id,
        filename: resume.originalFilename,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Server error uploading resume' });
  }
};

// Get user's active resume
export const getActiveResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const resume = await Resume.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!resume) {
      res.status(404).json({ error: 'No active resume found' });
      return;
    }

    res.status(200).json({
      resume: {
        id: resume.id,
        filename: resume.originalFilename,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error getting active resume:', error);
    res.status(500).json({ error: 'Server error getting resume' });
  }
};

// Get all user's resumes
export const getUserResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const resumes = await Resume.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      resumes: resumes.map(resume => ({
        id: resume.id,
        filename: resume.originalFilename,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting user resumes:', error);
    res.status(500).json({ error: 'Server error getting resumes' });
  }
};

// Delete a resume
export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const resume = await Resume.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Delete file from S3
    const s3Key = `resumes/${userId}/${resume.filename}`;
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET || 'autojobber',
      Key: s3Key,
    }).promise();

    // Delete resume record
    await resume.destroy();

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Server error deleting resume' });
  }
};

// Set a resume as active
export const setResumeActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    // Find the target resume
    const targetResume = await Resume.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!targetResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Find current active resume
    const activeResume = await Resume.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    // Begin transaction
    const transaction = await Resume.sequelize!.transaction();

    try {
      // If there's already an active resume and it's different from the target
      if (activeResume && activeResume.id !== targetResume.id) {
        // Set it as inactive
        await activeResume.update({ isActive: false }, { transaction });
      }

      // Set target resume as active
      await targetResume.update({ isActive: true }, { transaction });

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message: 'Resume set as active',
        resume: {
          id: targetResume.id,
          filename: targetResume.originalFilename,
          isActive: true,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error setting resume as active:', error);
    res.status(500).json({ error: 'Server error setting resume as active' });
  }
}; 