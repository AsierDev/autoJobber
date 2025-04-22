import axios from 'axios';
import { API_URL } from '../config/constants';

// Crear instancia de axios con configuración predeterminada
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token de autenticación
api.interceptors.request.use(
  (config) => {
    // Para desarrollo, usar un token simulado
    // En producción, obtendríamos el token del localStorage o de un estado de autenticación
    const mockToken = 'mock-token-for-development';
    config.headers.Authorization = `Bearer ${mockToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 