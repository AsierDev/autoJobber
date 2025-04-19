import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SimpleNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">AutoJobber</span>
            </div>
            <div className="ml-6 flex space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/') && !location.pathname.startsWith('/company-ratings')
                    ? 'text-blue-600 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Aplicaciones
              </Link>
              <Link 
                to="/profile" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/profile') 
                    ? 'text-blue-600 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Perfil
              </Link>
              <Link 
                to="/preferences" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/preferences') 
                    ? 'text-blue-600 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Preferencias
              </Link>
              <Link 
                to="/resume" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/resume') 
                    ? 'text-blue-600 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Currículum
              </Link>
              <Link 
                to="/company-ratings" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/company-ratings') 
                    ? 'text-blue-600 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Empresas
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className={`${
              isActive('/') && !location.pathname.startsWith('/company-ratings')
                ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }`}
          >
            Aplicaciones
          </Link>
          <Link 
            to="/profile" 
            className={`${
              isActive('/profile') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }`}
          >
            Perfil
          </Link>
          <Link 
            to="/preferences" 
            className={`${
              isActive('/preferences') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }`}
          >
            Preferencias
          </Link>
          <Link 
            to="/resume" 
            className={`${
              isActive('/resume') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }`}
          >
            Currículum
          </Link>
          <Link 
            to="/company-ratings" 
            className={`${
              isActive('/company-ratings') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }`}
          >
            Empresas
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation; 