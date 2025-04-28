
import React from 'react';
import { Button } from '@/components/ui/button';

export const ResidentContactSuccess: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-800">Thank You!</h3>
        <p className="mt-2 text-sm text-green-600">
          We've received your information and will contact you when our specialized service for Italian tax residents is available.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button"
          onClick={() => window.location.href = '/ResidentSuccessPage'}
          className="bg-form-400 hover:bg-form-500"
        >
          Continue to success page
        </Button>
      </div>
    </div>
  );
};
