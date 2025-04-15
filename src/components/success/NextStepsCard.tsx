
import React from 'react';

const NextStepsCard = () => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">What happens next?</h2>
          <p className="text-gray-600 mt-2">
            Your submitted information will be reviewed, and we'll prepare the relevant tax forms.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                1
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Information Review</h3>
              <p className="mt-1 text-sm text-gray-500">
                Our tax specialists will review the information you've provided.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                2
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Form Preparation</h3>
              <p className="mt-1 text-sm text-gray-500">
                We'll prepare the necessary tax forms based on your information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                3
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Communication</h3>
              <p className="mt-1 text-sm text-gray-500">
                We'll reach out to you via email if any additional information is needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextStepsCard;
