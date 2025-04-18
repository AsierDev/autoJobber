import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbName = process.env.DB_NAME || 'autojobber';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = 'postgres';

// Create Sequelize instance
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test the database connection
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Sync all models
    // In production, you may want to use migrations instead
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synced successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}; 