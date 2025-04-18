import React from 'react';

interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  applicationDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'ghosted';
  matchScore: number | null;
}

interface JobApplicationsListProps {
  applications?: JobApplication[];
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

const SimpleJobApplicationsList: React.FC<JobApplicationsListProps> = ({ 
  applications, 
  onViewDetails, 
  onUpdateStatus 
}) => {
  // Valores de ejemplo si no se proporcionan applications
  const sampleApplications: JobApplication[] = applications || [
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
  
  // Funciones por defecto si no se proporcionan
  const handleViewDetails = onViewDetails || ((id: string) => console.log(`Ver detalles de ${id}`));
  const handleUpdateStatus = onUpdateStatus || ((id: string, status: string) => console.log(`Actualizar estado de ${id} a ${status}`));
  
  // Mapeo de estados a colores
  const statusColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800',
    interview: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
    ghosted: 'bg-yellow-100 text-yellow-800',
  };
  
  // Mapeo de estados a etiquetas
  const statusLabels: Record<string, string> = {
    applied: 'Aplicada',
    interview: 'Entrevista',
    offer: 'Oferta',
    rejected: 'Rechazada',
    withdrawn: 'Retirada',
    ghosted: 'Sin respuesta',
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Tus Aplicaciones de Trabajo
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {sampleApplications.length} aplicación(es)
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puesto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Aplicación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coincidencia
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sampleApplications.map((application) => (
              <tr 
                key={application.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(application.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                  {application.location && (
                    <div className="text-sm text-gray-500">{application.location}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.company}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {application.applicationDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[application.status] || ''
                    }`}
                  >
                    {statusLabels[application.status] || application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          application.matchScore && application.matchScore >= 80 ? 'bg-green-500' :
                          application.matchScore && application.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${application.matchScore || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{application.matchScore || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(application.id, 'interview');
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Actualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleJobApplicationsList; 