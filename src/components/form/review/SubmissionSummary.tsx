
import React from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

interface SubmissionSummaryProps {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({ owners, properties, assignments }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-green-800 mb-3">Ready for Submission</h3>
      <p className="text-green-700 mb-4">
        You have completed all required information for your property owner tax declaration.
        Upon submission, your data will be processed for tax assessment purposes.
      </p>
      <p className="text-green-700 mb-2">
        A confirmation email will be sent to you with a summary of your submitted information.
      </p>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
        <p className="font-medium mb-1">🚨 Disclaimer:</p>
        <p>By submitting this form, you acknowledge that you take full responsibility for the accuracy of all information provided. 
        We are not liable for any errors, omissions, or inaccuracies in the submitted data. Please ensure all information is 
        complete and correct before proceeding with submission.</p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mt-6">
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Owners</h4>
            <p className="text-3xl font-bold text-form-400">{owners.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Properties</h4>
            <p className="text-3xl font-bold text-form-400">{properties.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Assignments</h4>
            <p className="text-3xl font-bold text-form-400">{assignments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSummary;
