
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600">Loading your dashboard...</p>
    </div>
  );
};
