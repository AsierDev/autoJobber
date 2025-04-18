import React from 'react';

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

interface ProfileSummaryProps {
  stats: ProfileStats;
  resumeInfo: ResumeInfo | null;
  onUploadResume: () => void;
  onUpdateResume: () => void;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  stats,
  resumeInfo,
  onUploadResume,
  onUpdateResume,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Overview</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Summary of your job search activity
          </p>
        </div>
        {resumeInfo ? (
          <button
            type="button"
            onClick={onUpdateResume}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Resume
          </button>
        ) : (
          <button
            type="button"
            onClick={onUploadResume}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Resume
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 py-5 sm:p-6">
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Job Application Stats</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Total Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalApplications}</dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Active Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeApplications}</dd>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-purple-700">Interviews</dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-900">{stats.interviews}</dd>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-green-700">Offers</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">{stats.offers}</dd>
            </div>
          </dl>
          
          {/* Conversion rates */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Application to Interview Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalApplications ? Math.round((stats.interviews / stats.totalApplications) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalApplications ? Math.round((stats.interviews / stats.totalApplications) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Interview to Offer Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.interviews ? Math.round((stats.offers / stats.interviews) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.interviews ? Math.round((stats.offers / stats.interviews) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Resume Information</h4>
          
          {resumeInfo ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-500">Profile Completeness</h5>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          resumeInfo.completionScore >= 80 
                            ? 'bg-green-500' 
                            : resumeInfo.completionScore >= 50 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${resumeInfo.completionScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {resumeInfo.completionScore}%
                  </span>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-500">Top Skills</h5>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resumeInfo.topSkills.map((skill, index) => (
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
                <p>Last updated: {resumeInfo.lastUpdated}</p>
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
              <p className="mt-2 text-sm font-medium text-gray-900">No resume uploaded yet</p>
              <p className="mt-1 text-sm text-gray-500">Upload your resume to get started with your job search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary; 