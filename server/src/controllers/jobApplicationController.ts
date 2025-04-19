import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import JobApplication from '../models/JobApplication';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

// Get all job applications for a user
export const getAllJobApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const applications = await JobApplication.findAll({
      where: { userId },
      order: [['applicationDate', 'DESC']],
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific job application by ID
export const getJobApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    return res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new job application
export const createJobApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      jobTitle,
      company,
      location,
      jobDescription,
      applicationUrl,
      applicationDate,
      status,
      source,
      notes,
      salary,
      followUpDate,
    } = req.body;

    // Validation
    if (!jobTitle || !company || !applicationDate) {
      return res.status(400).json({ message: 'Job title, company, and application date are required' });
    }

    const newApplication = await JobApplication.create({
      id: uuidv4(),
      userId,
      jobTitle,
      company,
      location,
      jobDescription,
      applicationUrl,
      applicationDate,
      status: status || 'applied',
      source,
      notes,
      salary,
      followUpDate,
      isActive: true,
    });

    return res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating job application:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing job application
export const updateJobApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    const {
      jobTitle,
      company,
      location,
      jobDescription,
      applicationUrl,
      applicationDate,
      status,
      source,
      notes,
      salary,
      feedback,
      followUpDate,
      isActive,
    } = req.body;

    await application.update({
      ...(jobTitle && { jobTitle }),
      ...(company && { company }),
      ...(location !== undefined && { location }),
      ...(jobDescription !== undefined && { jobDescription }),
      ...(applicationUrl !== undefined && { applicationUrl }),
      ...(applicationDate && { applicationDate }),
      ...(status && { status }),
      ...(source !== undefined && { source }),
      ...(notes !== undefined && { notes }),
      ...(salary !== undefined && { salary }),
      ...(feedback !== undefined && { feedback }),
      ...(followUpDate !== undefined && { followUpDate }),
      ...(isActive !== undefined && { isActive }),
    });

    return res.status(200).json(application);
  } catch (error) {
    console.error('Error updating job application:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job application
export const deleteJobApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    await application.destroy();

    return res.status(200).json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get job application statistics
export const getJobApplicationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Count applications by status
    const statusCounts = await JobApplication.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      where: { userId },
      group: ['status'],
    });

    // Get applications per month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await JobApplication.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('applicationDate')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        userId,
        applicationDate: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('applicationDate'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('applicationDate')), 'ASC']],
    });

    // Get upcoming follow-ups
    const upcomingFollowUps = await JobApplication.findAll({
      where: {
        userId,
        followUpDate: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      order: [['followUpDate', 'ASC']],
    });

    return res.status(200).json({
      statusCounts,
      monthlyApplications,
      upcomingFollowUps
    });
  } catch (error) {
    console.error('Error fetching job application statistics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add or update feedback for a job application
export const updateApplicationFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    await application.update({ feedback });

    return res.status(200).json(application);
  } catch (error) {
    console.error('Error updating job application feedback:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update the follow-up date for a job application
export const updateFollowUpDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { followUpDate } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    await application.update({ followUpDate });

    return res.status(200).json(application);
  } catch (error) {
    console.error('Error updating follow-up date:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 