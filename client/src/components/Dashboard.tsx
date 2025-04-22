import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveResume, ResumeData } from '../services/resumeService';
import { getActiveJobPreference } from '../services/jobPreferenceService';

interface JobPreference {
  title: string;
  industry: string;
  location: string;
  workMode: string;
  minSalary: number;
  maxSalary: number;
  companySize: string;
  keywords: string[];
}

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

const Dashboard: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [preference, setPreference] = useState<JobPreference | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock statistics for now
  const stats: DashboardStats = {
    totalApplications: 24,
    activeApplications: 15,
    interviews: 5,
    offers: 2,
    rejections: 7,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch resume and preferences in parallel
        const [resumeData, preferenceData] = await Promise.all([
          getActiveResume().catch(() => null),
          getActiveJobPreference().catch(() => null)
        ]);
        
        setResume(resumeData);
        setPreference(preferenceData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('No se pudieron cargar todos los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Aplicaciones Totales</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Aplicaciones Activas</p>
          <p className="text-2xl font-bold text-blue-600">{stats.activeApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Entrevistas</p>
          <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Ofertas</p>
          <p className="text-2xl font-bold text-green-600">{stats.offers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Rechazos</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejections}</p>
        </div>
      </div>

      {/* Quick Setup Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Estado de Configuración</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${resume ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {resume ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <div>
                <h3 className="font-medium">Currículum</h3>
                <p className="text-sm text-gray-500">
                  {resume ? 'CV subido y procesado' : 'Sube tu CV para comenzar'}
                </p>
              </div>
            </div>
            <Link
              to="/resume"
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                resume ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {resume ? 'Actualizar' : 'Completar'}
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${preference ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {preference ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <div>
                <h3 className="font-medium">Preferencias de Búsqueda</h3>
                <p className="text-sm text-gray-500">
                  {preference ? `Buscando: ${preference.title}` : 'Define tus preferencias de trabajo'}
                </p>
              </div>
            </div>
            <Link
              to="/preferences"
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                preference ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {preference ? 'Actualizar' : 'Completar'}
            </Link>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      {resume && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">CV Activo</h2>
            <Link
              to="/resume"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ver Completo
            </Link>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-lg">{resume.name}</h3>
            <p className="text-gray-600">{resume.email}</p>
            
            {resume.skills && resume.skills.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-500">Principales Habilidades:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resume.skills.slice(0, 5).map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {resume.skills.length > 5 && (
                    <span className="text-gray-500 text-xs ml-1">
                      +{resume.skills.length - 5} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Preferences Preview */}
      {preference && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Preferencias de Búsqueda</h2>
            <Link
              to="/preferences"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Editar
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Puesto Deseado</h3>
              <p className="font-medium">{preference.title}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Industria</h3>
              <p className="font-medium">{preference.industry || 'No especificado'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
              <p className="font-medium">{preference.location || 'No especificado'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Modalidad</h3>
              <p className="font-medium">
                {preference.workMode === 'remote' && 'Remoto'}
                {preference.workMode === 'hybrid' && 'Híbrido'}
                {preference.workMode === 'onsite' && 'Presencial'}
                {!preference.workMode && 'No especificado'}
              </p>
            </div>
            
            {preference.keywords && preference.keywords.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Palabras Clave</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preference.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CTA for incomplete setup */}
      {(!resume || !preference) && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
          <h2 className="text-xl font-medium text-blue-800 mb-2">
            ¡Completa tu configuración para comenzar!
          </h2>
          <p className="text-blue-600 mb-4">
            Para que podamos ayudarte a encontrar el trabajo ideal, completa tu CV
            {!resume && !preference && ' y'} 
            {!preference && ' tus preferencias de búsqueda'}
          </p>
          
          <div className="flex justify-center space-x-4">
            {!resume && (
              <Link
                to="/resume"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Subir CV
              </Link>
            )}
            
            {!preference && (
              <Link
                to="/preferences"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Definir Preferencias
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 