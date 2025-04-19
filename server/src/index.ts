import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes (will be created later)
// import authRoutes from './routes/auth';
// import userRoutes from './routes/user';
// import resumeRoutes from './routes/resume';
import resumeRoutes from './routes/resumeRoutes';
import jobPreferenceRoutes from './routes/jobPreferenceRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import jobApplicationAttachmentRoutes from './routes/jobApplicationAttachmentRoutes';
import companyRatingRoutes from './routes/companyRatingRoutes';
// import jobRoutes from './routes/job';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'autojobber',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

// Test database connection
async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize notification schedulers (only in production or if explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NOTIFICATIONS === 'true') {
      try {
        // Dynamic import to avoid issues with missing dependencies in development
        const { initNotificationSchedulers } = await import('./schedulers/notificationScheduler');
        initNotificationSchedulers();
      } catch (error) {
        console.error('Failed to initialize notification schedulers:', error);
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testDbConnection();

// Routes
app.get('/', (req, res) => {
  res.send('AutoJobber API is running');
});

// Register routes (will be enabled once created)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-preferences', jobPreferenceRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/attachments', jobApplicationAttachmentRoutes);
app.use('/api/company-ratings', companyRatingRoutes);
// app.use('/api/jobs', jobRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 