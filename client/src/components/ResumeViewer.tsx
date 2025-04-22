import React from 'react';
import { ResumeData } from '../services/resumeService';

interface ResumeViewerProps {
  resume: ResumeData;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ resume }) => {
  if (!resume) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No hay información de currículum disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with name and contact info */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{resume.name}</h2>
        <div className="flex flex-col space-y-1 text-gray-600">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>{resume.email}</span>
          </div>
          {resume.phone && (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{resume.phone}</span>
            </div>
          )}
          {resume.location && (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{resume.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary section */}
      {resume.summary && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Resumen Profesional</h3>
          <p className="text-gray-600">{resume.summary}</p>
        </div>
      )}

      {/* Skills section */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill.name}
                {skill.level && ` (${skill.level})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience section */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Experiencia Laboral</h3>
          <div className="space-y-6">
            {resume.experience.map((exp, index) => (
              <div key={index} className={index !== resume.experience.length - 1 ? "pb-6 border-b" : ""}>
                <div className="flex justify-between">
                  <h4 className="text-base font-medium text-gray-900">{exp.title}</h4>
                  <div className="text-sm text-gray-500">
                    {exp.start_date} - {exp.end_date || 'Presente'}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 mt-1">
                  {exp.company}
                  {exp.location && <span> • {exp.location}</span>}
                </div>
                {exp.description && (
                  <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                    {exp.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education section */}
      {resume.education && resume.education.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Educación</h3>
          <div className="space-y-6">
            {resume.education.map((edu, index) => (
              <div key={index} className={index !== resume.education.length - 1 ? "pb-6 border-b" : ""}>
                <div className="flex justify-between">
                  <h4 className="text-base font-medium text-gray-900">{edu.degree}</h4>
                  <div className="text-sm text-gray-500">
                    {edu.start_date} - {edu.end_date || 'Presente'}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 mt-1">
                  {edu.institution}
                  {edu.field && <span> • {edu.field}</span>}
                </div>
                {edu.gpa && (
                  <div className="mt-1 text-sm text-gray-600">
                    GPA: {edu.gpa}
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

export default ResumeViewer; 