
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  isFullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Processing your submission...', 
  isFullScreen = false 
}) => {
  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
      isFullScreen ? '' : 'animate-fade-in'
    }`}>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
