import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleNavigation from './components/SimpleNavigation';
import SimpleJobApplicationsList from './components/SimpleJobApplicationsList';
import SimpleProfileSummary from './components/SimpleProfileSummary';
import SimpleJobPreferencesForm from './components/SimpleJobPreferencesForm';
import SimpleResumeUpload from './components/SimpleResumeUpload';

// Datos de muestra
const mockApplications = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    applicationDate: '2023-05-15',
    status: 'applied',
    matchScore: 85,
  },
  {
    id: '2',
    jobTitle: 'React Developer',
    company: 'WebSolutions',
    location: 'San Francisco, CA',
    applicationDate: '2023-05-20',
    status: 'interview',
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

const App = () => {
  const [applications] = useState(mockApplications);
  
  const handleViewDetails = (id) => {
    console.log(`Viendo detalles de la aplicación ${id}`);
  };
  
  const handleUpdateStatus = (id, status) => {
    console.log(`Actualizando estado de la aplicación ${id} a ${status}`);
  };
  
  const handleSubmitPreferences = async (values) => {
    console.log('Enviando preferencias:', values);
    // En una app real, esto sería una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  const handleResumeUploadSuccess = (resumeData) => {
    console.log('Currículum subido exitosamente:', resumeData);
  };
  
  const handleUploadResume = () => {
    console.log('Navegando a subida de currículum');
  };
  
  const handleUpdateResume = () => {
    console.log('Navegando a actualización de currículum');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <SimpleNavigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <SimpleJobApplicationsList 
                applications={applications} 
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            } />
            <Route path="/profile" element={
              <SimpleProfileSummary 
                stats={mockStats}
                resumeInfo={mockResumeInfo}
                onUploadResume={handleUploadResume}
                onUpdateResume={handleUpdateResume}
              />
            } />
            <Route path="/preferences" element={
              <SimpleJobPreferencesForm onSubmit={handleSubmitPreferences} />
            } />
            <Route path="/resume" element={
              <SimpleResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 