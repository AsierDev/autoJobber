import express from 'express';
import {
  getAllCompanyRatings,
  getCompanyRatingsByCompany,
  getUserCompanyRatings,
  createCompanyRating,
  updateCompanyRating,
  deleteCompanyRating,
  getTopRatedCompanies
} from '../controllers/companyRatingController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
// Get all company ratings (with optional company filter)
router.get('/public', getAllCompanyRatings);

// Get ratings for a specific company
router.get('/public/company/:companyName', getCompanyRatingsByCompany);

// Get top rated companies
router.get('/public/top', getTopRatedCompanies);

// Protected routes
router.use(authenticate);

// Get user's company ratings
router.get('/my-ratings', getUserCompanyRatings);

// Create a new company rating
router.post('/', createCompanyRating);

// Update a company rating
router.put('/:id', updateCompanyRating);

// Delete a company rating
router.delete('/:id', deleteCompanyRating);

export default router; 