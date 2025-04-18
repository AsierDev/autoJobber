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
// import jobRoutes from './routes/job';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// app.use('/api/resumes', resumeRoutes);
// app.use('/api/jobs', jobRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 