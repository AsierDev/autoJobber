import api from './api';

// Types
export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  jobDescription: string | null;
  applicationUrl: string | null;
  applicationDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'ghosted';
  source: string | null;
  notes: string | null;
  salary: number | null;
  feedback: string | null;
  matchScore: number | null;
  followUpDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationStats {
  statusCounts: Array<{ status: string; count: number }>;
  monthlyApplications: Array<{ month: string; count: number }>;
  upcomingFollowUps: JobApplication[];
}

// Get all user's job applications
export const getAllJobApplications = async (): Promise<JobApplication[]> => {
  const response = await api.get('/job-applications');
  return response.data;
};

// Get a specific job application by ID
export const getJobApplicationById = async (id: string): Promise<JobApplication> => {
  const response = await api.get(`/job-applications/${id}`);
  return response.data;
};

// Create a new job application
export const createJobApplication = async (applicationData: Partial<JobApplication>): Promise<JobApplication> => {
  const response = await api.post('/job-applications', applicationData);
  return response.data;
};

// Update an existing job application
export const updateJobApplication = async (id: string, applicationData: Partial<JobApplication>): Promise<JobApplication> => {
  const response = await api.put(`/job-applications/${id}`, applicationData);
  return response.data;
};

// Delete a job application
export const deleteJobApplication = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/job-applications/${id}`);
  return response.data;
};

// Get job application statistics
export const getJobApplicationStats = async (): Promise<JobApplicationStats> => {
  const response = await api.get('/job-applications/stats');
  return response.data;
};

// Update follow-up date for a job application
export const updateFollowUpDate = async (id: string, followUpDate: string | null): Promise<JobApplication> => {
  const response = await api.put(`/job-applications/${id}/followup`, { followUpDate });
  return response.data;
};

// Update feedback for a job application
export const updateApplicationFeedback = async (id: string, feedback: string): Promise<JobApplication> => {
  const response = await api.put(`/job-applications/${id}/feedback`, { feedback });
  return response.data;
}; 