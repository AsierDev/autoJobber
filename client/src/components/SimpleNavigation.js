import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SimpleNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
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
                  isActive('/') 
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation; 