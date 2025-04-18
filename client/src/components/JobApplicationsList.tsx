import React, { useState } from 'react';
import { format } from 'date-fns';

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
  applications: JobApplication[];
  onViewDetails: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
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

const JobApplicationsList: React.FC<JobApplicationsListProps> = ({
  applications,
  onViewDetails,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter applications
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
    } else if (sortBy === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortBy === 'title') {
      comparison = a.jobTitle.localeCompare(b.jobTitle);
    } else if (sortBy === 'score') {
      const scoreA = a.matchScore || 0;
      const scoreB = b.matchScore || 0;
      comparison = scoreA - scoreB;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Job Applications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="ghosted">No Response</option>
          </select>
        </div>
      </div>
      
      {sortedApplications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Position {getSortIcon('title')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center">
                    Company {getSortIcon('company')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Applied On {getSortIcon('date')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                {applications.some(app => app.matchScore !== null) && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center">
                      Match {getSortIcon('score')}
                    </div>
                  </th>
                )}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedApplications.map((application) => (
                <tr 
                  key={application.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewDetails(application.id)}
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
                      {format(new Date(application.applicationDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[application.status]
                      }`}
                    >
                      {statusLabels[application.status]}
                    </span>
                  </td>
                  {applications.some(app => app.matchScore !== null) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.matchScore !== null && (
                        <div className="flex items-center">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: '100px',
                              backgroundColor: '#e5e7eb',
                            }}
                          >
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${application.matchScore}%`,
                                backgroundColor: getScoreColor(application.matchScore),
                              }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {Math.round(application.matchScore)}%
                          </span>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      value={application.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(application.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full pl-3 pr-10 py-2 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="ghosted">No Response</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-500">No job applications found. Start adding your applications!</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on match score
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#34D399'; // green
  if (score >= 60) return '#FBBF24'; // yellow
  return '#F87171'; // red
};

export default JobApplicationsList;