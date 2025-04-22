import { API_URL } from '../config/constants';

// Token de autenticación temporal para desarrollo
const MOCK_TOKEN = 'Bearer mock-token-for-development';

interface ResumeSkill {
  name: string;
  level?: string;
}

interface ResumeExperience {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string[];
}

interface ResumeEducation {
  institution: string;
  degree: string;
  field?: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
}

export interface ResumeData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  filename?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
}

// Upload a resume file
export const uploadResume = async (file: File): Promise<ResumeData> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/api/resumes/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': MOCK_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error uploading resume');
    }

    const data = await response.json();
    return data.resume;
  } catch (error) {
    console.error('Error in uploadResume:', error);
    throw error;
  }
};

// Get the active resume
export const getActiveResume = async (): Promise<ResumeData | null> => {
  try {
    const response = await fetch(`${API_URL}/api/resumes/active`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MOCK_TOKEN
      }
    });

    if (response.status === 404) {
      // No active resume found
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching active resume');
    }

    const data = await response.json();
    return data.resume;
  } catch (error) {
    console.error('Error in getActiveResume:', error);
    throw error;
  }
};

// Get all user resumes
export const getUserResumes = async (): Promise<ResumeData[]> => {
  try {
    const response = await fetch(`${API_URL}/api/resumes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MOCK_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching resumes');
    }

    const data = await response.json();
    return data.resumes;
  } catch (error) {
    console.error('Error in getUserResumes:', error);
    throw error;
  }
};

// Set a resume as active
export const setResumeActive = async (resumeId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/resumes/${resumeId}/active`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MOCK_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error setting resume as active');
    }
  } catch (error) {
    console.error('Error in setResumeActive:', error);
    throw error;
  }
};

// Delete a resume
export const deleteResume = async (resumeId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MOCK_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error deleting resume');
    }
  } catch (error) {
    console.error('Error in deleteResume:', error);
    throw error;
  }
}; 