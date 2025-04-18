import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleNavigation from './components/SimpleNavigation';
import SimpleJobApplicationsList from './components/SimpleJobApplicationsList';
import SimpleProfileSummary from './components/SimpleProfileSummary';
import SimpleJobPreferencesForm from './components/SimpleJobPreferencesForm';
import SimpleResumeUpload from './components/SimpleResumeUpload';
import { createJobPreference } from './services/jobPreferenceService';

// Definición de tipos
interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  applicationDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'ghosted';
  matchScore: number | null;
}

interface ProfileStats {
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

interface ResumeInfo {
  name: string;
  email: string;
  topSkills: string[];
  lastUpdated: string;
  completionScore: number;
}

interface ResumeData {
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
  lastUpdated: string;
}

// Datos de muestra
const mockApplications: JobApplication[] = [
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

const mockStats: ProfileStats = {
  totalApplications: 24,
  activeApplications: 15,
  interviews: 5,
  offers: 2,
  rejections: 7,
};

const mockResumeInfo: ResumeInfo = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  topSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  lastUpdated: '2023-04-28',
  completionScore: 85,
};

const App: React.FC = () => {
  const [applications] = useState<JobApplication[]>(mockApplications);
  
  const handleViewDetails = (id: string): void => {
    console.log(`Viendo detalles de la aplicación ${id}`);
  };
  
  const handleUpdateStatus = (id: string, status: string): void => {
    console.log(`Actualizando estado de la aplicación ${id} a ${status}`);
  };
  
  const handleSubmitPreferences = async (values: any): Promise<void> => {
    try {
      console.log('Enviando preferencias:', values);
      await createJobPreference(values);
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      throw error;
    }
  };
  
  const handleResumeUploadSuccess = (resumeData: ResumeData): void => {
    console.log('Currículum subido exitosamente:', resumeData);
  };
  
  const handleUploadResume = (): void => {
    console.log('Navegando a subida de currículum');
  };
  
  const handleUpdateResume = (): void => {
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