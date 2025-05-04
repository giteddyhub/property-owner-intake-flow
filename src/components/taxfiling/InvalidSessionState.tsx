
import React from 'react';
import { Button } from '@/components/ui/button';

interface InvalidSessionStateProps {
  onReturnToDashboard: () => void;
}

const InvalidSessionState: React.FC<InvalidSessionStateProps> = ({ 
  onReturnToDashboard 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h1>
      <p className="text-gray-600 mb-6">This tax filing session is invalid or has expired.</p>
      <Button onClick={onReturnToDashboard}>Return to Dashboard</Button>
    </div>
  );
};

export default InvalidSessionState;
