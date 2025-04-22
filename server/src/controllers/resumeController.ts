import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import Resume from '../models/Resume';
import axios from 'axios';
import multer from 'multer';
import { sanitizeFilename } from '../utils/fileUtils';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  signatureVersion: 'v4',
});

// Validate S3 configuration on startup
const validateS3Config = async (): Promise<boolean> => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials not configured');
    return false;
  }
  
  try {
    const bucketName = process.env.AWS_S3_BUCKET || 'autojobber';
    // Check if bucket exists and we have access
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Successfully connected to S3 bucket: ${bucketName}`);
    return true;
  } catch (error) {
    console.error('Error connecting to S3:', error);
    return false;
  }
};

// Call validation at module load time
validateS3Config();

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
      // Sanitize the original filename to prevent injection attacks
      const sanitizedName = sanitizeFilename(file.originalname);
      const uniqueFilename = `${uuidv4()}${path.extname(sanitizedName)}`;
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

    // En entorno de desarrollo, si estamos usando el token simulado, simular una subida exitosa
    if (process.env.NODE_ENV !== 'production' && userId === '00000000-0000-0000-0000-000000000000') {
      const file = req.file;
      // Simular una respuesta exitosa con datos simulados
      res.status(201).json({
        message: 'Resume uploaded successfully',
        resume: {
          id: 'mock-resume-uploaded-id',
          filename: file.filename || 'simulated_file.pdf',
          originalFilename: file.originalname || 'user_cv.pdf',
          fileUrl: 'https://example.com/simulated_file.pdf',
          fileType: file.mimetype || 'application/pdf',
          fileSize: file.size || 150000,
          parsedData: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            location: 'Ciudad de México, México',
            summary: 'Desarrollador de software con experiencia en React, Node.js y TypeScript.',
            skills: [
              { name: 'JavaScript', level: 'Avanzado' },
              { name: 'TypeScript', level: 'Intermedio' },
              { name: 'React', level: 'Avanzado' },
              { name: 'Node.js', level: 'Intermedio' },
              { name: 'Express', level: 'Intermedio' },
              { name: 'SQL', level: 'Básico' }
            ],
            experience: [
              {
                title: 'Desarrollador Frontend',
                company: 'Tech Solutions',
                location: 'Ciudad de México',
                start_date: '2020-01',
                end_date: '2022-06',
                description: ['Desarrollo de aplicaciones web con React', 'Implementación de diseños responsive', 'Integración con APIs RESTful']
              },
              {
                title: 'Desarrollador Junior',
                company: 'StartupX',
                location: 'Guadalajara',
                start_date: '2018-06',
                end_date: '2019-12',
                description: ['Mantenimiento de aplicaciones web', 'Corrección de bugs', 'Implementación de nuevas funcionalidades']
              }
            ],
            education: [
              {
                institution: 'Universidad Nacional Autónoma de México',
                degree: 'Licenciatura en Ingeniería en Computación',
                field: 'Ciencias de la Computación',
                start_date: '2014-08',
                end_date: '2018-05',
                gpa: 9.1
              }
            ]
          },
          createdAt: new Date().toISOString(),
        },
      });
      return;
    }

    // Continuar con la lógica normal para producción
    try {
      // Check if S3 is configured
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        res.status(500).json({ error: 'AWS S3 is not properly configured' });
        return;
      }

      const file = req.file;
      const filePath = file.path;
      const fileType = file.mimetype;
      const fileSize = file.size;
      
      // Sanitize original filename
      const originalFilename = sanitizeFilename(file.originalname);
      const s3Key = `resumes/${userId}/${path.basename(filePath)}`;

      // Additional validation
      if (fileSize > 5 * 1024 * 1024) {
        // Clean up local file
        fs.unlinkSync(filePath);
        res.status(400).json({ error: 'File size exceeds the maximum limit of 5MB' });
        return;
      }

      // Validate content type from the actual file (not just the extension)
      if (
        fileType !== 'application/pdf' &&
        fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // Clean up local file
        fs.unlinkSync(filePath);
        res.status(400).json({ error: 'Invalid file type. Only PDF and DOCX files are allowed' });
        return;
      }

      // Upload file to S3
      const fileContent = fs.readFileSync(filePath);
      const bucketName = process.env.AWS_S3_BUCKET || 'autojobber';
      const s3Result = await s3.upload({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: fileType,
        ACL: 'private',
        // Set metadata for better organization
        Metadata: {
          'user-id': userId,
          'original-filename': originalFilename,
          'upload-date': new Date().toISOString(),
        },
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
    } catch (dbError) {
      console.error('Database error uploading resume:', dbError);
      res.status(500).json({ error: 'Database error uploading resume' });
    }
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Server error uploading resume' });
  }
};

// Get the active resume
export const getActiveResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // En entorno de desarrollo, si estamos usando el token simulado, devolver datos simulados
    if (process.env.NODE_ENV !== 'production' && userId === '00000000-0000-0000-0000-000000000000') {
      // Datos simulados para desarrollo
      res.status(200).json({
        resume: {
          id: 'mock-resume-id',
          filename: 'sample_resume.pdf',
          originalFilename: 'my_resume.pdf',
          fileUrl: 'https://example.com/sample_resume.pdf',
          fileType: 'application/pdf',
          fileSize: 124500,
          isActive: true,
          parsedData: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            location: 'Ciudad de México, México',
            summary: 'Desarrollador de software con experiencia en React, Node.js y TypeScript.',
            skills: [
              { name: 'JavaScript', level: 'Avanzado' },
              { name: 'TypeScript', level: 'Intermedio' },
              { name: 'React', level: 'Avanzado' },
              { name: 'Node.js', level: 'Intermedio' },
              { name: 'Express', level: 'Intermedio' },
              { name: 'SQL', level: 'Básico' }
            ],
            experience: [
              {
                title: 'Desarrollador Frontend',
                company: 'Tech Solutions',
                location: 'Ciudad de México',
                start_date: '2020-01',
                end_date: '2022-06',
                description: ['Desarrollo de aplicaciones web con React', 'Implementación de diseños responsive', 'Integración con APIs RESTful']
              },
              {
                title: 'Desarrollador Junior',
                company: 'StartupX',
                location: 'Guadalajara',
                start_date: '2018-06',
                end_date: '2019-12',
                description: ['Mantenimiento de aplicaciones web', 'Corrección de bugs', 'Implementación de nuevas funcionalidades']
              }
            ],
            education: [
              {
                institution: 'Universidad Nacional Autónoma de México',
                degree: 'Licenciatura en Ingeniería en Computación',
                field: 'Ciencias de la Computación',
                start_date: '2014-08',
                end_date: '2018-05',
                gpa: 9.1
              }
            ]
          },
          createdAt: new Date().toISOString(),
        }
      });
      return;
    }

    // Continuar con la lógica normal para producción
    try {
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
        },
      });
    } catch (dbError) {
      console.error('Database error getting active resume:', dbError);
      res.status(500).json({ error: 'Database error getting active resume' });
    }
  } catch (error) {
    console.error('Error getting active resume:', error);
    res.status(500).json({ error: 'Server error getting active resume' });
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

    // En entorno de desarrollo, si estamos usando el token simulado, devolver datos simulados
    if (process.env.NODE_ENV !== 'production' && userId === '00000000-0000-0000-0000-000000000000') {
      // Datos simulados para desarrollo
      res.status(200).json({
        resumes: [
          {
            id: 'mock-resume-id',
            filename: 'sample_resume.pdf',
            originalFilename: 'my_resume.pdf',
            fileUrl: 'https://example.com/sample_resume.pdf',
            fileType: 'application/pdf',
            fileSize: 124500,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mock-resume-id-2',
            filename: 'old_resume.pdf',
            originalFilename: 'old_resume.pdf',
            fileUrl: 'https://example.com/old_resume.pdf',
            fileType: 'application/pdf',
            fileSize: 98700,
            isActive: false,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
          }
        ]
      });
      return;
    }

    // Continuar con la lógica normal para producción
    try {
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
    } catch (dbError) {
      console.error('Database error getting user resumes:', dbError);
      res.status(500).json({ error: 'Database error getting resumes' });
    }
  } catch (error) {
    console.error('Error getting user resumes:', error);
    res.status(500).json({ error: 'Server error getting resumes' });
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

    // En entorno de desarrollo con usuario simulado, simular éxito
    if (process.env.NODE_ENV !== 'production' && userId === '00000000-0000-0000-0000-000000000000') {
      res.status(200).json({ message: 'Resume set as active' });
      return;
    }

    // Lógica normal para producción
    try {
      // Find the resume to set as active
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

      // Find and update the currently active resume
      const activeResume = await Resume.findOne({
        where: {
          userId,
          isActive: true,
        },
      });

      if (activeResume && activeResume.id !== id) {
        await activeResume.update({ isActive: false });
      }

      // Set the selected resume as active
      await resume.update({ isActive: true });

      res.status(200).json({ message: 'Resume set as active' });
    } catch (dbError) {
      console.error('Database error setting resume as active:', dbError);
      res.status(500).json({ error: 'Database error setting resume as active' });
    }
  } catch (error) {
    console.error('Error setting resume as active:', error);
    res.status(500).json({ error: 'Server error setting resume as active' });
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

    // En entorno de desarrollo con usuario simulado, simular éxito
    if (process.env.NODE_ENV !== 'production' && userId === '00000000-0000-0000-0000-000000000000') {
      res.status(200).json({ message: 'Resume deleted successfully' });
      return;
    }

    // Lógica normal para producción
    try {
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
      const bucketName = process.env.AWS_S3_BUCKET || 'autojobber';
      const s3Key = `resumes/${userId}/${resume.filename}`;
      
      try {
        await s3.deleteObject({
          Bucket: bucketName,
          Key: s3Key,
        }).promise();
      } catch (s3Error) {
        console.error('Error deleting file from S3:', s3Error);
        // Continue with deleting the database record even if S3 deletion fails
      }

      // Delete resume record
      await resume.destroy();

      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (dbError) {
      console.error('Database error deleting resume:', dbError);
      res.status(500).json({ error: 'Database error deleting resume' });
    }
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Server error deleting resume' });
  }
}; 