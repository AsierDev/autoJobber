import React, { useState, ChangeEvent, FormEvent, useRef, DragEvent } from 'react';
import { uploadResume, ResumeData } from '../services/resumeService';

interface ResumeUploadProps {
  onUploadSuccess?: (data: ResumeData) => void;
}

const SimpleResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    validateAndSetFile(files[0]);
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Por favor, sube un archivo PDF o DOCX');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo primero');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const resumeData = await uploadResume(selectedFile);
      
      if (onUploadSuccess) {
        onUploadSuccess(resumeData);
      }
    } catch (err: any) {
      console.error('Error al subir el currículum:', err);
      
      let errorMessage = 'Ocurrió un error al procesar tu currículum. Por favor, intenta de nuevo.';
      
      // Intentar extraer el mensaje de error del JSON si existe
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
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sube tu Currículum</h2>
      <p className="text-gray-600 mb-6">
        Sube tu currículum para que podamos analizar tus habilidades y experiencia y ayudarte a encontrar empleos relevantes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className={`border-2 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-dashed'} p-6 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file"
          />
          
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0h8m-8 0v-8m0 0v-8m0 0h8m-8 0h-8m8 8h8"
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Haz clic para seleccionar o arrastra tu currículum aquí
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Archivos PDF o DOCX solamente (máx. 5MB)
          </p>
        </div>
        
        {selectedFile && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center">
              <svg 
                className="h-6 w-6 text-blue-500 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </span>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Eliminar
            </button>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            'Subir Currículum'
          )}
        </button>
      </form>
    </div>
  );
};

export default SimpleResumeUpload;