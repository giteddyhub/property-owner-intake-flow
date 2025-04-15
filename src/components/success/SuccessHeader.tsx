
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Submission Successful!</h1>
      <p className="mt-2 text-lg text-gray-600">
        Thank you for submitting your property tax information.
      </p>
    </div>
  );
};

export default SuccessHeader;
