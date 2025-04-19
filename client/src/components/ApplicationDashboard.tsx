import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getJobApplicationStats, JobApplicationStats } from '../services/jobApplicationService';

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

const bgColors = {
  applied: 'rgba(59, 130, 246, 0.5)',
  interview: 'rgba(139, 92, 246, 0.5)',
  offer: 'rgba(16, 185, 129, 0.5)',
  rejected: 'rgba(239, 68, 68, 0.5)',
  withdrawn: 'rgba(156, 163, 175, 0.5)',
  ghosted: 'rgba(245, 158, 11, 0.5)',
};

const ApplicationDashboard: React.FC = () => {
  const [stats, setStats] = useState<JobApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getJobApplicationStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load application statistics. Please try again.');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
              onClick={fetchStats}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalApplications = stats.statusCounts.reduce((acc, statusCount) => acc + statusCount.count, 0);
  
  // Calculate success rate (offers divided by total)
  const offerCount = stats.statusCounts.find(sc => sc.status === 'offer')?.count || 0;
  const successRate = totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0;
  
  // Calculate interview rate (interviews divided by total)
  const interviewCount = stats.statusCounts.find(sc => sc.status === 'interview')?.count || 0;
  const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium">Total Applications</p>
              <p className="text-gray-900 text-2xl font-semibold">{totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium">Success Rate</p>
              <p className="text-gray-900 text-2xl font-semibold">{successRate}%</p>
              <p className="text-gray-500 text-xs">({offerCount} offers)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium">Interview Rate</p>
              <p className="text-gray-900 text-2xl font-semibold">{interviewRate}%</p>
              <p className="text-gray-500 text-xs">({interviewCount} interviews)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications by status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Applications by Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.statusCounts.map((statusCount) => (
              <div 
                key={statusCount.status} 
                className="border rounded-lg p-4 flex items-center justify-between"
                style={{ borderColor: bgColors[statusCount.status as keyof typeof bgColors] }}
              >
                <div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[statusCount.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[statusCount.status as keyof typeof statusLabels]}
                  </span>
                  <p className="mt-1 text-gray-500 text-sm">
                    {totalApplications > 0
                      ? Math.round((statusCount.count / totalApplications) * 100)
                      : 0}% of applications
                  </p>
                </div>
                <div className="text-2xl font-bold">{statusCount.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications by month */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Applications by Month</h3>
        </div>
        <div className="p-6">
          {stats.monthlyApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data available for the last 6 months</p>
          ) : (
            <div className="h-64">
              <div className="flex h-full items-end">
                {stats.monthlyApplications.map((monthly) => {
                  const monthDate = parseISO(monthly.month);
                  const monthName = format(monthDate, 'MMM yyyy');
                  
                  // Calculate the height percentage based on max count
                  const maxCount = Math.max(...stats.monthlyApplications.map(m => m.count));
                  const heightPercent = maxCount > 0 ? (monthly.count / maxCount) * 100 : 0;
                  
                  return (
                    <div 
                      key={monthly.month} 
                      className="flex-1 flex flex-col items-center"
                    >
                      <div 
                        className="w-5/6 bg-blue-500 rounded-t"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      >
                        <div className="h-full w-full flex items-center justify-center">
                          {monthly.count > 0 && (
                            <span className="text-white font-bold text-sm">{monthly.count}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center w-full truncate">
                        {monthName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming follow-ups */}
      {stats.upcomingFollowUps.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Follow-ups</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.upcomingFollowUps.map((application) => (
              <div key={application.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{application.company}</h4>
                    <p className="text-sm text-gray-500">{application.jobTitle}</p>
                    <div className="mt-1 flex items-center">
                      <span
                        className={`mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[application.status]
                        }`}
                      >
                        {statusLabels[application.status]}
                      </span>
                      {application.location && (
                        <span className="text-xs text-gray-500">{application.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Follow up on: {format(new Date(application.followUpDate!), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied: {format(new Date(application.applicationDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                {application.notes && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {application.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDashboard; 