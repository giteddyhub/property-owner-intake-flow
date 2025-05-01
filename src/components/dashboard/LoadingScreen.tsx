
import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoadingScreenProps {
  timeout?: number; // Timeout in milliseconds
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ timeout = 15000 }) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {!isTimedOut ? (
        <>
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </>
      ) : (
        <div className="text-center max-w-md px-4">
          <div className="mb-4 text-amber-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-16 h-16 mx-auto"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Timed Out</h2>
          <p className="text-gray-600 mb-6">
            It's taking longer than expected to load your dashboard. This could be due to connectivity issues or server load.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={handleRefresh} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> 
              Refresh Page
            </button>
            <button 
              onClick={handleGoHome} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
