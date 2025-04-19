import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  JobApplication, 
  getJobApplicationById, 
  updateJobApplication, 
  updateFollowUpDate, 
  updateApplicationFeedback 
} from '../services/jobApplicationService';
import AttachmentList from './AttachmentList';
import CompanyRatingsManager from './CompanyRatingsManager';

interface JobApplicationDetailProps {
  id?: string;
  onBack?: () => void;
  onUpdate?: () => void;
}

const statusColors = {
  applied: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
  ghosted: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  ghosted: 'No Response',
};

const JobApplicationDetail: React.FC<JobApplicationDetailProps> = ({ 
  id: propId, 
  onBack: propOnBack, 
  onUpdate: propOnUpdate 
}) => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use prop id if provided, otherwise use id from URL params
  const id = propId || urlId || '';
  
  // Default handlers if not provided via props
  const onBack = propOnBack || (() => navigate('/'));
  const onUpdate = propOnUpdate || (() => {});

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>({});
  const [saving, setSaving] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showCompanyRatings, setShowCompanyRatings] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const data = await getJobApplicationById(id);
      setApplication(data);
      
      // Initialize form data
      setFormData({
        jobTitle: data.jobTitle,
        company: data.company,
        location: data.location,
        jobDescription: data.jobDescription,
        applicationUrl: data.applicationUrl,
        applicationDate: data.applicationDate.split('T')[0], // Format date for input
        status: data.status,
        source: data.source,
        salary: data.salary,
      });
      
      setNotes(data.notes || '');
      setFeedback(data.feedback || '');
      setFollowUpDate(data.followUpDate ? data.followUpDate.split('T')[0] : '');
      
      setError(null);
    } catch (err) {
      setError('Failed to load application details. Please try again.');
      console.error('Error fetching application details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'salary' ? (value ? parseInt(value) : null) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    try {
      setSaving(true);
      await updateJobApplication(application.id, formData);
      await fetchApplicationDetails(); // Refresh data
      setIsEditing(false);
      onUpdate(); // Notify parent to refresh list
    } catch (err) {
      setError('Failed to update application. Please try again.');
      console.error('Error updating application:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNotesSubmit = async () => {
    if (!application) return;

    try {
      setSaving(true);
      await updateJobApplication(application.id, { notes });
      await fetchApplicationDetails(); // Refresh data
      setIsEditingNotes(false);
    } catch (err) {
      setError('Failed to update notes. Please try again.');
      console.error('Error updating notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!application) return;

    try {
      setSaving(true);
      await updateApplicationFeedback(application.id, feedback);
      await fetchApplicationDetails(); // Refresh data
      setIsEditingFeedback(false);
    } catch (err) {
      setError('Failed to update feedback. Please try again.');
      console.error('Error updating feedback:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowUpDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    try {
      setSaving(true);
      await updateFollowUpDate(application.id, followUpDate || null);
      await fetchApplicationDetails(); // Refresh data
    } catch (err) {
      setError('Failed to update follow-up date. Please try again.');
      console.error('Error updating follow-up date:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleAttachments = () => {
    setShowAttachments(!showAttachments);
  };

  if (loading && !application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={onBack}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Job Application Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {application.company} - {application.jobTitle}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Application
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="jobTitle"
                      id="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700">
                    Application Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="applicationDate"
                      id="applicationDate"
                      value={formData.applicationDate || ''}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status || 'applied'}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="ghosted">No Response</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="source"
                      id="source"
                      value={formData.source || ''}
                      onChange={handleInputChange}
                      placeholder="LinkedIn, Indeed, Company Website, etc."
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Salary (Annual)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="salary"
                      id="salary"
                      value={formData.salary || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700">
                    Application URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="applicationUrl"
                      id="applicationUrl"
                      value={formData.applicationUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="jobDescription"
                      name="jobDescription"
                      rows={4}
                      value={formData.jobDescription || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.jobTitle}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.company}</dd>
              </div>
              {application.location && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.location}</dd>
                </div>
              )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(application.applicationDate), 'MMMM d, yyyy')}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[application.status]
                    }`}
                  >
                    {statusLabels[application.status]}
                  </span>
                </dd>
              </div>
              {application.source && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.source}</dd>
                </div>
              )}
              {application.salary && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Salary</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${application.salary.toLocaleString()}
                  </dd>
                </div>
              )}
              {application.applicationUrl && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Application URL</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a
                      href={application.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      {application.applicationUrl}
                    </a>
                  </dd>
                </div>
              )}
              {application.matchScore !== null && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Match Score</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <div
                        className="h-2 rounded-full w-24 bg-gray-200"
                      >
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${application.matchScore}%` }}
                        />
                      </div>
                      <span className="ml-2">{application.matchScore}%</span>
                    </div>
                  </dd>
                </div>
              )}
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Follow-up Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <form onSubmit={handleFollowUpDateSubmit} className="flex items-center">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md mr-2"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                        saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Set Reminder'}
                    </button>
                  </form>
                  {application.followUpDate && (
                    <p className="mt-2 text-xs text-gray-500">
                      Currently set for: {format(new Date(application.followUpDate), 'MMMM d, yyyy')}
                    </p>
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditingNotes ? (
                    <div>
                      <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add your notes here..."
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingNotes(false)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleNotesSubmit}
                          disabled={saving}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                            saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {saving ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {application.notes ? (
                        <p className="whitespace-pre-line">{application.notes}</p>
                      ) : (
                        <p className="text-gray-500 italic">No notes added yet</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(true)}
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {application.notes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                    </div>
                  )}
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditingFeedback ? (
                    <div>
                      <textarea
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add interview feedback, rejection reasons, or other comments from the employer..."
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingFeedback(false)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleFeedbackSubmit}
                          disabled={saving}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                            saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {saving ? 'Saving...' : 'Save Feedback'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {application.feedback ? (
                        <p className="whitespace-pre-line">{application.feedback}</p>
                      ) : (
                        <p className="text-gray-500 italic">No feedback recorded yet</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsEditingFeedback(true)}
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {application.feedback ? 'Edit Feedback' : 'Add Feedback'}
                      </button>
                    </div>
                  )}
                </dd>
              </div>

              {application.jobDescription && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Job Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                    {application.jobDescription}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Archivos adjuntos
          </h3>
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showAttachments ? 'Ocultar' : 'Mostrar'}
            <svg
              className={`ml-1.5 h-4 w-4 transform ${showAttachments ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {showAttachments && (
          <div className="px-4 py-5 sm:p-6">
            <AttachmentList jobApplicationId={application.id} />
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Calificaciones para {application.company}
          </h3>
          <button
            onClick={() => setShowCompanyRatings(!showCompanyRatings)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showCompanyRatings ? 'Ocultar' : 'Mostrar'}
            <svg
              className={`ml-1.5 h-4 w-4 transform ${showCompanyRatings ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {showCompanyRatings && (
          <div className="px-4 py-5 sm:p-6">
            <CompanyRatingsManager 
              mode="company" 
              companyName={application.company} 
              jobApplicationId={application.id} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationDetail; 