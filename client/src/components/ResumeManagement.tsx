import React, { useState, useEffect } from 'react';
import { getActiveResume, ResumeData, getUserResumes, setResumeActive, deleteResume } from '../services/resumeService';
import ResumeViewer from './ResumeViewer';
import SimpleResumeUpload from './SimpleResumeUpload';

const ResumeManagement: React.FC = () => {
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [userResumes, setUserResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showResumes, setShowResumes] = useState<boolean>(false);

  const fetchActiveResume = async () => {
    try {
      setLoading(true);
      setError(null);
      const resume = await getActiveResume();
      setActiveResume(resume);
      return resume;
    } catch (err: any) {
      let errorMessage = 'Error al obtener el currículum activo';
      try {
        if (err.message) {
          const errorObj = JSON.parse(err.message);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        }
      } catch (parseErr) {
        // Si no podemos analizar el error, usamos el mensaje predeterminado
      }
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const resumes = await getUserResumes();
      setUserResumes(resumes);
    } catch (err: any) {
      let errorMessage = 'Error al obtener los currículums del usuario';
      try {
        if (err.message) {
          const errorObj = JSON.parse(err.message);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        }
      } catch (parseErr) {
        // Si no podemos analizar el error, usamos el mensaje predeterminado
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const activeResume = await fetchActiveResume();
      if (!activeResume) {
        // If no active resume, show upload form
        setShowUpload(true);
      }
    };

    loadData();
  }, []);

  const handleUploadSuccess = async (resumeData: ResumeData) => {
    setShowUpload(false);
    setSuccess('¡Currículum subido exitosamente!');
    await fetchActiveResume();
    
    // Ocultar el mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleSetActive = async (resumeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await setResumeActive(resumeId);
      await fetchActiveResume();
      setShowResumes(false);
      setSuccess('Currículum establecido como activo');
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      let errorMessage = 'Error al establecer el currículum como activo';
      try {
        if (err.message) {
          const errorObj = JSON.parse(err.message);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        }
      } catch (parseErr) {
        // Si no podemos analizar el error, usamos el mensaje predeterminado
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este currículum?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteResume(resumeId);
        await fetchUserResumes();
        
        // Check if we deleted the active resume
        if (activeResume && activeResume.id === resumeId) {
          await fetchActiveResume();
        }
        
        setSuccess('Currículum eliminado correctamente');
        
        // Ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err: any) {
        let errorMessage = 'Error al eliminar el currículum';
        try {
          if (err.message) {
            const errorObj = JSON.parse(err.message);
            if (errorObj.error) {
              errorMessage = errorObj.error;
            }
          }
        } catch (parseErr) {
          // Si no podemos analizar el error, usamos el mensaje predeterminado
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleResumes = async () => {
    if (!showResumes && userResumes.length === 0) {
      await fetchUserResumes();
    }
    setShowResumes(!showResumes);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión del Currículum</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {showUpload ? 'Cancelar' : 'Subir Nuevo CV'}
          </button>
          
          <button
            onClick={toggleResumes}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {showResumes ? 'Ocultar CVs' : 'Ver Todos los CVs'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {showUpload && (
        <div className="mt-6">
          <SimpleResumeUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {!showUpload && (
        <>
          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Currículum Activo
            </h3>
            {activeResume ? (
              <p className="text-blue-600">
                Utilizando el currículum subido el {new Date(activeResume.createdAt || '').toLocaleDateString()}
              </p>
            ) : (
              <p className="text-blue-600">
                No tienes un currículum activo. Sube uno nuevo para comenzar.
              </p>
            )}
          </div>

          {activeResume && (
            <ResumeViewer resume={activeResume} />
          )}
        </>
      )}

      {showResumes && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Todos tus Currículums</h3>
          
          {userResumes.length === 0 ? (
            <p className="text-gray-500">No tienes currículums guardados</p>
          ) : (
            <div className="space-y-4">
              {userResumes.map(resume => (
                <div 
                  key={resume.id} 
                  className={`border rounded-lg p-4 ${resume.id === activeResume?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {resume.name}
                        {resume.id === activeResume?.id && (
                          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Activo
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Subido el {new Date(resume.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {resume.id !== activeResume?.id && (
                        <button
                          onClick={() => handleSetActive(resume.id!)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Establecer como activo
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteResume(resume.id!)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeManagement; 