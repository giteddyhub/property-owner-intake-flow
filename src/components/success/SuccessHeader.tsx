
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Ready for Italian Tax Filing
      </h1>
      <p className="text-lg text-gray-600">
        Our team of experts will handle your Italian tax declaration
      </p>
    </div>
  );
};

export default SuccessHeader;
