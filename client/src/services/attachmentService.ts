import api from './api';

// Types
export interface JobApplicationAttachment {
  id: string;
  jobApplicationId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string | null;
  attachmentType: 'resume' | 'cover_letter' | 'email' | 'offer_letter' | 'other';
  createdAt: string;
  updatedAt: string;
}

// Get all attachments for a specific job application
export const getJobApplicationAttachments = async (jobApplicationId: string): Promise<JobApplicationAttachment[]> => {
  const response = await api.get(`/attachments/application/${jobApplicationId}`);
  return response.data;
};

// Upload a new attachment
export const uploadAttachment = async (
  jobApplicationId: string,
  file: File,
  attachmentType: JobApplicationAttachment['attachmentType'],
  description?: string
): Promise<JobApplicationAttachment> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('attachmentType', attachmentType);
  
  if (description) {
    formData.append('description', description);
  }
  
  const response = await api.post(
    `/attachments/application/${jobApplicationId}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

// Get a specific attachment by ID
export const getAttachmentById = async (id: string): Promise<JobApplicationAttachment> => {
  const response = await api.get(`/attachments/${id}`);
  return response.data;
};

// Update attachment details
export const updateAttachment = async (
  id: string,
  data: { description?: string; attachmentType?: JobApplicationAttachment['attachmentType'] }
): Promise<JobApplicationAttachment> => {
  const response = await api.put(`/attachments/${id}`, data);
  return response.data;
};

// Delete an attachment
export const deleteAttachment = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/attachments/${id}`);
  return response.data;
}; 