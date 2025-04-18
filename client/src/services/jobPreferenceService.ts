import api from './api';
import axios, { AxiosError } from 'axios';

interface JobPreferenceData {
  title: string;
  industry?: string;
  location?: string;
  workMode?: 'remote' | 'hybrid' | 'onsite' | '' | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | '' | null;
  keywords?: string[];
}

// Create a new job preference
export const createJobPreference = async (data: JobPreferenceData) => {
  try {
    const response = await api.post('/job-preferences', data);
    return response.data;
  } catch (error) {
    console.error('Error creating job preference:', error);
    throw error;
  }
};

// Get active job preference
export const getActiveJobPreference = async () => {
  try {
    const response = await api.get('/job-preferences/active');
    return response.data.preference;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // No active preference found, return null
      return null;
    }
    console.error('Error fetching active job preference:', error);
    throw error;
  }
};

// Get all job preferences
export const getAllJobPreferences = async () => {
  try {
    const response = await api.get('/job-preferences');
    return response.data.preferences;
  } catch (error) {
    console.error('Error fetching job preferences:', error);
    throw error;
  }
};

// Update a job preference
export const updateJobPreference = async (id: string, data: JobPreferenceData) => {
  try {
    const response = await api.put(`/job-preferences/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating job preference:', error);
    throw error;
  }
};

// Delete a job preference
export const deleteJobPreference = async (id: string) => {
  try {
    const response = await api.delete(`/job-preferences/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job preference:', error);
    throw error;
  }
};

// Set a job preference as active
export const setJobPreferenceActive = async (id: string) => {
  try {
    const response = await api.put(`/job-preferences/${id}/active`);
    return response.data;
  } catch (error) {
    console.error('Error setting job preference as active:', error);
    throw error;
  }
}; 