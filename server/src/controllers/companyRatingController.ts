import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import CompanyRating from '../models/CompanyRating';
import JobApplication from '../models/JobApplication';
import { sequelize } from '../config/database';

// Get all company ratings (with optional company filter)
export const getAllCompanyRatings = async (req: Request, res: Response) => {
  try {
    const { company } = req.query;
    const whereClause: any = {};
    
    if (company) {
      whereClause.companyName = company;
    }

    const ratings = await CompanyRating.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'companyName',
        'overallRating',
        'interviewProcess',
        'workLifeBalance',
        'compensation',
        'careerGrowth',
        'review',
        'pros',
        'cons',
        'createdAt',
        [
          sequelize.literal(`
            CASE WHEN "anonymous" = true 
            THEN NULL 
            ELSE "userId" 
            END
          `),
          'userId'
        ]
      ]
    });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching company ratings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get ratings for a specific company
export const getCompanyRatingsByCompany = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.params;
    
    // Get company ratings
    const ratings = await CompanyRating.findAll({
      where: {
        companyName,
      },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'companyName',
        'overallRating',
        'interviewProcess',
        'workLifeBalance',
        'compensation',
        'careerGrowth',
        'review',
        'pros',
        'cons',
        'createdAt',
        [
          sequelize.literal(`
            CASE WHEN "anonymous" = true 
            THEN NULL 
            ELSE "userId" 
            END
          `),
          'userId'
        ]
      ]
    });

    // Calculate average ratings
    const avgRatings = await CompanyRating.findAll({
      where: {
        companyName,
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overallRating')), 'avgOverallRating'],
        [sequelize.fn('AVG', sequelize.col('interviewProcess')), 'avgInterviewProcess'],
        [sequelize.fn('AVG', sequelize.col('workLifeBalance')), 'avgWorkLifeBalance'],
        [sequelize.fn('AVG', sequelize.col('compensation')), 'avgCompensation'],
        [sequelize.fn('AVG', sequelize.col('careerGrowth')), 'avgCareerGrowth'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
      ],
    });

    return res.status(200).json({
      companyName,
      ratings,
      statistics: avgRatings[0],
    });
  } catch (error) {
    console.error('Error fetching company ratings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user's company ratings
export const getUserCompanyRatings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ratings = await CompanyRating.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching user company ratings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new company rating
export const createCompanyRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      jobApplicationId,
      companyName,
      overallRating,
      interviewProcess,
      workLifeBalance,
      compensation,
      careerGrowth,
      review,
      pros,
      cons,
      anonymous,
    } = req.body;

    // Validation
    if (!companyName || !overallRating) {
      return res.status(400).json({ message: 'Company name and overall rating are required' });
    }

    // Check if the job application exists and belongs to the user if provided
    if (jobApplicationId) {
      const jobApplication = await JobApplication.findOne({
        where: {
          id: jobApplicationId,
          userId,
        },
      });

      if (!jobApplication) {
        return res.status(404).json({ message: 'Job application not found' });
      }
    }

    // Create rating
    const newRating = await CompanyRating.create({
      id: uuidv4(),
      userId,
      jobApplicationId: jobApplicationId || null,
      companyName,
      overallRating,
      interviewProcess: interviewProcess || null,
      workLifeBalance: workLifeBalance || null,
      compensation: compensation || null,
      careerGrowth: careerGrowth || null,
      review: review || null,
      pros: pros || null,
      cons: cons || null,
      anonymous: anonymous || false,
    });

    return res.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating company rating:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a company rating
export const updateCompanyRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rating = await CompanyRating.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const {
      overallRating,
      interviewProcess,
      workLifeBalance,
      compensation,
      careerGrowth,
      review,
      pros,
      cons,
      anonymous,
    } = req.body;

    await rating.update({
      ...(overallRating && { overallRating }),
      ...(interviewProcess !== undefined && { interviewProcess }),
      ...(workLifeBalance !== undefined && { workLifeBalance }),
      ...(compensation !== undefined && { compensation }),
      ...(careerGrowth !== undefined && { careerGrowth }),
      ...(review !== undefined && { review }),
      ...(pros !== undefined && { pros }),
      ...(cons !== undefined && { cons }),
      ...(anonymous !== undefined && { anonymous }),
    });

    return res.status(200).json(rating);
  } catch (error) {
    console.error('Error updating company rating:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a company rating
export const deleteCompanyRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rating = await CompanyRating.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    await rating.destroy();

    return res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting company rating:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get top rated companies
export const getTopRatedCompanies = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const topCompanies = await CompanyRating.findAll({
      attributes: [
        'companyName',
        [sequelize.fn('AVG', sequelize.col('overallRating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
      ],
      group: ['companyName'],
      having: sequelize.literal('COUNT(id) >= 3'), // At least 3 ratings
      order: [[sequelize.literal('avgRating'), 'DESC']],
      limit: Number(limit),
    });

    return res.status(200).json(topCompanies);
  } catch (error) {
    console.error('Error fetching top rated companies:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 