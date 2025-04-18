import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { 
  createJobPreference, 
  getActiveJobPreference, 
  updateJobPreference 
} from '../services/jobPreferenceService';

interface JobPreferenceValues {
  title: string;
  industry: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite' | '';
  minSalary: string;
  maxSalary: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | '';
  keywords: string;
}

interface FormattedJobPreferenceValues {
  title: string;
  industry: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite' | '';
  minSalary: number | null;
  maxSalary: number | null;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | '';
  keywords: string[];
}

interface JobPreferencesFormProps {
  onSubmit?: (values: FormattedJobPreferenceValues) => Promise<void>;
  initialData?: JobPreferenceValues;
}

const SimpleJobPreferencesForm: React.FC<JobPreferencesFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<JobPreferenceValues>(initialData || {
    title: '',
    industry: '',
    location: '',
    workMode: '',
    minSalary: '',
    maxSalary: '',
    companySize: '',
    keywords: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Cargar preferencias activas al montar el componente
  useEffect(() => {
    const fetchActivePreference = async () => {
      try {
        setIsLoading(true);
        const activePreference = await getActiveJobPreference();
        
        if (activePreference) {
          setPreferenceId(activePreference.id);
          // Convertir preferencias del API al formato del formulario
          setFormData({
            title: activePreference.title || '',
            industry: activePreference.industry || '',
            location: activePreference.location || '',
            workMode: activePreference.workMode || '',
            minSalary: activePreference.minSalary ? activePreference.minSalary.toString() : '',
            maxSalary: activePreference.maxSalary ? activePreference.maxSalary.toString() : '',
            companySize: activePreference.companySize || '',
            keywords: activePreference.keywords ? activePreference.keywords.join(', ') : '',
          });
        }
      } catch (err) {
        console.error('Error al cargar preferencias:', err);
        setError('No se pudieron cargar las preferencias existentes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePreference();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validación simple
    if (!formData.title) {
      setError('El título del trabajo es obligatorio');
      return;
    }
    
    if (formData.minSalary && formData.maxSalary && 
        Number(formData.minSalary) > Number(formData.maxSalary)) {
      setError('El salario máximo debe ser mayor que el salario mínimo');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Formatear datos
      const formattedData: FormattedJobPreferenceValues = {
        ...formData,
        minSalary: formData.minSalary ? Number(formData.minSalary) : null,
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : null,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
      };
      
      // Si se recibió una función onSubmit personalizada, usarla
      if (onSubmit) {
        await onSubmit(formattedData);
      } else {
        // Si no, usar nuestro servicio API
        if (preferenceId) {
          // Actualizar preferencia existente
          await updateJobPreference(preferenceId, formattedData);
        } else {
          // Crear nueva preferencia
          const response = await createJobPreference(formattedData);
          setPreferenceId(response.preference.id);
        }
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error al enviar preferencias:', err);
      setError('Ocurrió un error al guardar las preferencias');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Preferencias de Búsqueda de Empleo</h2>
      
      {success && (
        <div className="mb-6 p-3 bg-green-50 text-green-800 rounded-md">
          Tus preferencias han sido guardadas correctamente.
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título del Trabajo *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ej. Ingeniero de Software, Gerente de Producto"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industria
          </label>
          <input
            type="text"
            name="industry"
            id="industry"
            value={formData.industry}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ej. Tecnología, Salud, Finanzas"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ej. Madrid, España"
          />
        </div>

        <div>
          <label htmlFor="workMode" className="block text-sm font-medium text-gray-700">
            Modalidad de Trabajo
          </label>
          <select
            name="workMode"
            id="workMode"
            value={formData.workMode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona la modalidad</option>
            <option value="remote">Remoto</option>
            <option value="hybrid">Híbrido</option>
            <option value="onsite">Presencial</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">
              Salario Mínimo (EUR)
            </label>
            <input
              type="number"
              name="minSalary"
              id="minSalary"
              value={formData.minSalary}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="ej. 30000"
            />
          </div>

          <div>
            <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700">
              Salario Máximo (EUR)
            </label>
            <input
              type="number"
              name="maxSalary"
              id="maxSalary"
              value={formData.maxSalary}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="ej. 60000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
            Tamaño de la Empresa
          </label>
          <select
            name="companySize"
            id="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona el tamaño</option>
            <option value="startup">Startup (1-50 empleados)</option>
            <option value="small">Pequeña (51-200 empleados)</option>
            <option value="medium">Mediana (201-1000 empleados)</option>
            <option value="large">Grande (1001-5000 empleados)</option>
            <option value="enterprise">Corporación (5000+ empleados)</option>
          </select>
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Palabras clave (separadas por comas)
          </label>
          <input
            type="text"
            name="keywords"
            id="keywords"
            value={formData.keywords}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ej. React, Python, Análisis de datos"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : (preferenceId ? 'Actualizar Preferencias' : 'Guardar Preferencias')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleJobPreferencesForm; 