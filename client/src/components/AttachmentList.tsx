import React, { useState, useEffect } from 'react';
import { JobApplicationAttachment, getJobApplicationAttachments, deleteAttachment, uploadAttachment, updateAttachment } from '../services/attachmentService';

interface AttachmentListProps {
  jobApplicationId: string;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ jobApplicationId }) => {
  const [attachments, setAttachments] = useState<JobApplicationAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<JobApplicationAttachment['attachmentType']>('other');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<JobApplicationAttachment['attachmentType']>('other');

  // Fetch attachments when component mounts or jobApplicationId changes
  useEffect(() => {
    fetchAttachments();
  }, [jobApplicationId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const data = await getJobApplicationAttachments(jobApplicationId);
      setAttachments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load attachments. Please try again.');
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      await uploadAttachment(jobApplicationId, file, attachmentType, description);
      fetchAttachments(); // Refresh list after upload
      
      // Reset form
      setFile(null);
      setAttachmentType('other');
      setDescription('');
      // Reset the file input
      const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(id);
        setAttachments(attachments.filter(attachment => attachment.id !== id));
      } catch (err) {
        setError('Failed to delete attachment. Please try again.');
        console.error('Error deleting attachment:', err);
      }
    }
  };

  const startEditing = (attachment: JobApplicationAttachment) => {
    setEditingId(attachment.id);
    setEditDescription(attachment.description || '');
    setEditType(attachment.attachmentType);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription('');
    setEditType('other');
  };

  const saveEdit = async (id: string) => {
    try {
      const updatedAttachment = await updateAttachment(id, {
        description: editDescription,
        attachmentType: editType
      });
      
      setAttachments(attachments.map(attachment => 
        attachment.id === id ? updatedAttachment : attachment
      ));
      
      setEditingId(null);
    } catch (err) {
      setError('Failed to update attachment. Please try again.');
      console.error('Error updating attachment:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatAttachmentType = (type: string): string => {
    switch (type) {
      case 'resume': return 'Resume';
      case 'cover_letter': return 'Cover Letter';
      case 'email': return 'Email';
      case 'offer_letter': return 'Offer Letter';
      case 'other': return 'Other';
      default: return type;
    }
  };

  if (loading && attachments.length === 0) {
    return <div className="text-center py-4">Loading attachments...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Application Attachments</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Upload and manage documents related to this job application
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded border">
          <div className="mb-4">
            <label htmlFor="attachment-file" className="block text-sm font-medium text-gray-700 mb-1">
              Upload file
            </label>
            <input
              type="file"
              id="attachment-file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="attachment-type" className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                id="attachment-type"
                value={attachmentType}
                onChange={(e) => setAttachmentType(e.target.value as JobApplicationAttachment['attachmentType'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="resume">Resume</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="email">Email</option>
                <option value="offer_letter">Offer Letter</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="attachment-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                id="attachment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="E.g., Tailored resume for this position"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                !file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>

        {attachments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
            <p className="mt-1 text-sm text-gray-500">Add documents related to this job application</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="py-4">
                {editingId === attachment.id ? (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="flex flex-col space-y-3">
                      <div>
                        <label htmlFor={`edit-type-${attachment.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type
                        </label>
                        <select
                          id={`edit-type-${attachment.id}`}
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as JobApplicationAttachment['attachmentType'])}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="resume">Resume</option>
                          <option value="cover_letter">Cover Letter</option>
                          <option value="email">Email</option>
                          <option value="offer_letter">Offer Letter</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`edit-desc-${attachment.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          id={`edit-desc-${attachment.id}`}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={cancelEditing}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(attachment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <a
                            href={process.env.REACT_APP_API_URL?.replace('/api', '') + attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {attachment.fileName}
                          </a>
                          <p className="text-sm text-gray-500">
                            {formatAttachmentType(attachment.attachmentType)} • {formatFileSize(attachment.fileSize)}
                          </p>
                          {attachment.description && (
                            <p className="mt-1 text-sm text-gray-600">{attachment.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(attachment)}
                            className="text-gray-400 hover:text-gray-500"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(attachment.id)}
                            className="text-red-400 hover:text-red-500"
                            title="Delete"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttachmentList; 