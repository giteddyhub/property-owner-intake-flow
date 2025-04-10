
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import FormNavigation from '../FormNavigation';

interface ReviewStepProps {
  onSubmitAttempt?: (formData: any) => void;
  isUserSignedUp?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onSubmitAttempt, isUserSignedUp = false }) => {
  const { state } = useFormContext();
  const { owners, properties, assignments } = state;

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-[#2F3FD4]">Review Your Information</h2>
      
      {/* Summary counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-600 mb-2">Total Owners</div>
          <div className="text-4xl font-bold text-[#2F3FD4]">{owners.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-600 mb-2">Total Properties</div>
          <div className="text-4xl font-bold text-[#2F3FD4]">{properties.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-600 mb-2">Total Assignments</div>
          <div className="text-4xl font-bold text-[#2F3FD4]">{assignments.length}</div>
        </div>
      </div>
      
      {/* Display details from previous steps */}
      <div className="space-y-8">
        {/* Owners section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#2F3FD4]">Owners</h3>
          <div className="space-y-3">
            {owners.length > 0 ? (
              owners.map((owner: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-bold text-xl">{owner.firstName} {owner.lastName}</div>
                  <div className="text-gray-600">{owner.isResidentInItaly ? 'Italian Resident' : 'Non-Italian Resident'}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No owners added yet.</div>
            )}
          </div>
        </div>
        
        {/* Properties section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#2F3FD4]">Properties</h3>
          <div className="space-y-3">
            {properties.length > 0 ? (
              properties.map((property: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-bold text-xl">{property.label}</div>
                  <div className="text-gray-600">{property.addressStreet}, {property.addressComune}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No properties added yet.</div>
            )}
          </div>
        </div>
        
        {/* Assignments section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#2F3FD4]">Assignments</h3>
          <div className="space-y-3">
            {assignments.length > 0 ? (
              assignments.map((assignment: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-bold text-xl">
                    {owners.find((o: any) => o.id === assignment.ownerId)?.firstName} {owners.find((o: any) => o.id === assignment.ownerId)?.lastName}
                  </div>
                  <div className="text-gray-600">
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
