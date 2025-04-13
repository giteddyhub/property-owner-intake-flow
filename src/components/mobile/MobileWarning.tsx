
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileWarning: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <div className="max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-form-400 mb-4">
          Please Switch to Desktop
        </h1>
        
        <p className="text-gray-600 mb-6">
          This Italian Tax Profile form is designed for desktop use. For the best experience and to ensure accurate completion of your tax information, please access this form on a desktop or laptop computer.
        </p>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-medium text-form-400 mb-3">Why Desktop?</h2>
          <ul className="text-sm text-gray-600 space-y-2 text-left mb-6">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Complex form entries that require detailed input</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Better visibility of all required fields and instructions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Easier document uploading and management</span>
            </li>
          </ul>
        </div>
        
        <Button 
          className="bg-form-300 hover:bg-form-400 text-white w-full"
          onClick={() => window.location.reload()}
        >
          I'm on Desktop, Refresh
        </Button>
      </div>
    </div>
  );
};

export default MobileWarning;
