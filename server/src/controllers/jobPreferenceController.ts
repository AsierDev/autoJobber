import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import JobPreference from '../models/JobPreference';

// Create a new job preference
export const createJobPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const preferenceData = req.body;

    // Validate required fields
    if (!preferenceData.title) {
      res.status(400).json({ error: 'Job title is required' });
      return;
    }

    // Create a unique ID for version tracking
    const versionId = uuidv4();

    // Check if user already has active preferences
    const existingPreference = await JobPreference.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    // If there are existing active preferences, deactivate them
    if (existingPreference) {
      await existingPreference.update({ isActive: false });
    }

    // Create new job preference
    const jobPreference = await JobPreference.create({
      ...preferenceData,
      userId,
      isActive: true,
    });

    res.status(201).json({
      message: 'Job preference created successfully',
      preference: jobPreference,
    });
  } catch (error) {
    console.error('Error creating job preference:', error);
    res.status(500).json({ error: 'Server error creating job preference' });
  }
};

// Get active job preference
export const getActiveJobPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const activePreference = await JobPreference.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!activePreference) {
      res.status(404).json({ error: 'No active job preference found' });
      return;
    }

    res.status(200).json({ preference: activePreference });
  } catch (error) {
    console.error('Error retrieving active job preference:', error);
    res.status(500).json({ error: 'Server error retrieving job preference' });
  }
};

// Get all job preferences for a user
export const getUserJobPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const preferences = await JobPreference.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ preferences });
  } catch (error) {
    console.error('Error retrieving job preferences:', error);
    res.status(500).json({ error: 'Server error retrieving job preferences' });
  }
};

// Update job preference
export const updateJobPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find the preference to update
    const preference = await JobPreference.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!preference) {
      res.status(404).json({ error: 'Job preference not found' });
      return;
    }

    // Create a new version instead of updating (for version history)
    // First, deactivate the current preference
    await preference.update({ isActive: false });

    // Then create a new preference with updated data
    const newPreference = await JobPreference.create({
      ...preference.toJSON(),
      ...updateData,
      id: uuidv4(), // New ID for the new version
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: 'Job preference updated successfully',
      preference: newPreference,
    });
  } catch (error) {
    console.error('Error updating job preference:', error);
    res.status(500).json({ error: 'Server error updating job preference' });
  }
};

// Delete job preference
export const deleteJobPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    // Find the preference to delete
    const preference = await JobPreference.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!preference) {
      res.status(404).json({ error: 'Job preference not found' });
      return;
    }

    // Delete the preference
    await preference.destroy();

    res.status(200).json({ message: 'Job preference deleted successfully' });
  } catch (error) {
    console.error('Error deleting job preference:', error);
    res.status(500).json({ error: 'Server error deleting job preference' });
  }
};

// Set a job preference as active
export const setJobPreferenceActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    // Find the preference to set as active
    const preference = await JobPreference.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!preference) {
      res.status(404).json({ error: 'Job preference not found' });
      return;
    }

    // Find and deactivate any currently active preferences
    const activePreference = await JobPreference.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (activePreference && activePreference.id !== id) {
      await activePreference.update({ isActive: false });
    }

    // Set the requested preference as active
    await preference.update({ isActive: true });

    res.status(200).json({
      message: 'Job preference set as active successfully',
      preference,
    });
  } catch (error) {
    console.error('Error setting job preference as active:', error);
    res.status(500).json({ error: 'Server error setting job preference as active' });
  }
}; 