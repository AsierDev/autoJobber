import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileSummary from './components/ProfileSummary';
import JobApplicationsList from './components/JobApplicationsList';
import JobPreferencesForm from './components/JobPreferencesForm';
import ResumeUpload from './components/ResumeUpload';
import Navigation from './components/Navigation';

// Sample data for demonstration
const mockApplications = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    applicationDate: '2023-05-15',
    status: 'applied' as const,
    matchScore: 85,
  },
  {
    id: '2',
    jobTitle: 'React Developer',
    company: 'WebSolutions',
    location: 'San Francisco, CA',
    applicationDate: '2023-05-20',
    status: 'interview' as const,
    matchScore: 92,
  },
];

const mockStats = {
  totalApplications: 24,
  activeApplications: 15,
  interviews: 5,
  offers: 2,
  rejections: 7,
};

const mockResumeInfo = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  topSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  lastUpdated: '2023-04-28',
  completionScore: 85,
};

const App: React.FC = () => {
  const [applications] = useState(mockApplications);
  
  const handleViewDetails = (id: string) => {
    console.log(`Viewing details for application ${id}`);
  };
  
  const handleUpdateStatus = (id: string, status: string) => {
    console.log(`Updating status for application ${id} to ${status}`);
  };
  
  const handleSubmitPreferences = async (values: any) => {
    console.log('Submitting preferences:', values);
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  const handleResumeUploadSuccess = (resumeData: any) => {
    console.log('Resume uploaded successfully:', resumeData);
  };
  
  const handleUploadResume = () => {
    console.log('Navigating to resume upload');
  };
  
  const handleUpdateResume = () => {
    console.log('Navigating to resume update');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <JobApplicationsList 
                applications={applications} 
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            } />
            <Route path="/profile" element={
              <ProfileSummary 
                stats={mockStats}
                resumeInfo={mockResumeInfo}
                onUploadResume={handleUploadResume}
                onUpdateResume={handleUpdateResume}
              />
            } />
            <Route path="/preferences" element={
              <JobPreferencesForm onSubmit={handleSubmitPreferences} />
            } />
            <Route path="/resume" element={
              <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 