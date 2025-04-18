import React from 'react';

const SimpleProfileSummary = ({ stats, resumeInfo, onUploadResume, onUpdateResume }) => {
  // Datos de muestra si no se proporcionan
  const mockStats = stats || {
    totalApplications: 24,
    activeApplications: 15,
    interviews: 5,
    offers: 2,
    rejections: 7,
  };

  const mockResumeInfo = resumeInfo || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    topSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    lastUpdated: '2023-04-28',
    completionScore: 85,
  };

  // Funciones por defecto si no se proporcionan
  const handleUploadResume = onUploadResume || (() => console.log('Subiendo currículum...'));
  const handleUpdateResume = onUpdateResume || (() => console.log('Actualizando currículum...'));

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Resumen de Perfil</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Resumen de tu actividad de búsqueda de empleo
          </p>
        </div>
        {mockResumeInfo ? (
          <button
            type="button"
            onClick={handleUpdateResume}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actualizar Currículum
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUploadResume}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Subir Currículum
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 py-5 sm:p-6">
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Estadísticas de Aplicaciones</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Total de Aplicaciones</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{mockStats.totalApplications}</dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Aplicaciones Activas</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{mockStats.activeApplications}</dd>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-purple-700">Entrevistas</dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-900">{mockStats.interviews}</dd>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-green-700">Ofertas</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">{mockStats.offers}</dd>
            </div>
          </dl>
          
          {/* Tasas de conversión */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tasa de Aplicación a Entrevista</span>
                <span className="text-sm font-medium text-gray-900">
                  {mockStats.totalApplications ? Math.round((mockStats.interviews / mockStats.totalApplications) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${mockStats.totalApplications ? Math.round((mockStats.interviews / mockStats.totalApplications) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tasa de Entrevista a Oferta</span>
                <span className="text-sm font-medium text-gray-900">
                  {mockStats.interviews ? Math.round((mockStats.offers / mockStats.interviews) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${mockStats.interviews ? Math.round((mockStats.offers / mockStats.interviews) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Información del Currículum</h4>
          
          {mockResumeInfo ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-500">Completitud del Perfil</h5>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          mockResumeInfo.completionScore >= 80 
                            ? 'bg-green-500' 
                            : mockResumeInfo.completionScore >= 50 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${mockResumeInfo.completionScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {mockResumeInfo.completionScore}%
                  </span>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-500">Habilidades Principales</h5>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockResumeInfo.topSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Última actualización: {mockResumeInfo.lastUpdated}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-900">Aún no se ha subido ningún currículum</p>
              <p className="mt-1 text-sm text-gray-500">Sube tu currículum para comenzar con tu búsqueda de empleo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleProfileSummary; 