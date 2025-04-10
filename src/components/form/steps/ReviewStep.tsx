
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import FormNavigation from '../FormNavigation';

interface ReviewStepProps {
  onSubmitAttempt?: (formData: any) => void; // Updated to accept formData parameter
  isUserSignedUp?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onSubmitAttempt, isUserSignedUp = false }) => {
  const { state } = useFormContext();
  const { owners, properties, assignments } = state;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review Your Information</h2>
      
      {/* Summary counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Owners</div>
          <div className="text-2xl font-bold text-form-400">{owners.length}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Properties</div>
          <div className="text-2xl font-bold text-form-400">{properties.length}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Assignments</div>
          <div className="text-2xl font-bold text-form-400">{assignments.length}</div>
        </div>
      </div>
      
      {/* Display details from previous steps */}
      <div className="space-y-6">
        {/* Owners section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-form-300">Owners</h3>
          <div className="space-y-3">
            {owners.length > 0 ? (
              owners.map((owner: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-medium">{owner.firstName} {owner.lastName}</div>
                  <div className="text-sm text-gray-500">{owner.isResidentInItaly ? 'Italian Resident' : 'Non-Italian Resident'}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No owners added yet.</div>
            )}
          </div>
        </div>
        
        {/* Properties section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-form-300">Properties</h3>
          <div className="space-y-3">
            {properties.length > 0 ? (
              properties.map((property: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-medium">{property.label}</div>
                  <div className="text-sm text-gray-500">{property.addressStreet}, {property.addressComune}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No properties added yet.</div>
            )}
          </div>
        </div>
        
        {/* Assignments section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-form-300">Assignments</h3>
          <div className="space-y-3">
            {assignments.length > 0 ? (
              assignments.map((assignment: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-medium">
                    {owners.find((o: any) => o.id === assignment.ownerId)?.firstName} {owners.find((o: any) => o.id === assignment.ownerId)?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {properties.find((p: any) => p.id === assignment.propertyId)?.label} - {assignment.ownershipPercentage}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No assignments added yet.</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Form Navigation */}
      <FormNavigation 
        showNext={true}
        onSubmitAttempt={onSubmitAttempt}
        isUserSignedUp={isUserSignedUp}
      />
    </div>
  );
};

export default ReviewStep;
