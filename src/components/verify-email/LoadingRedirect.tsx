
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingRedirect: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-form-600 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900">Redirecting to dashboard...</h1>
            <p className="text-gray-600">
              Email verified successfully!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingRedirect;
