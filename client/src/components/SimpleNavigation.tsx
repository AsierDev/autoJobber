import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SimpleNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl">
                AutoJobber
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link 
                to="/applications" 
                className={`${
                  isActive('/applications') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Aplicaciones
              </Link>
              <Link 
                to="/resume" 
                className={`${
                  isActive('/resume') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Currículum
              </Link>
              <Link 
                to="/preferences" 
                className={`${
                  isActive('/preferences') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Preferencias
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Ver notificaciones</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Dashboard
          </Link>
          <Link
            to="/applications"
            className={`${
              isActive('/applications') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Aplicaciones
          </Link>
          <Link
            to="/resume"
            className={`${
              isActive('/resume') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Currículum
          </Link>
          <Link
            to="/preferences"
            className={`${
              isActive('/preferences') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Preferencias
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation; 