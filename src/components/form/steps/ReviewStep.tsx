import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import FormNavigation from '@/components/form/FormNavigation';

const ReviewStep: React.FC = () => {
  const { state, nextStep } = useFormContext();
  const { owners, properties, assignments } = state;

  const handleNext = () => {
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Review Your Information</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Owners</h3>
        {owners.length > 0 ? (
          <ul className="list-disc pl-5">
            {owners.map((owner) => (
              <li key={owner.id} className="mb-2">
                {owner.firstName} {owner.lastName}
              </li>
            ))}
          </ul>
        ) : (
          <p>No owners added.</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Properties</h3>
        {properties.length > 0 ? (
          <ul className="list-disc pl-5">
            {properties.map((property) => (
              <li key={property.id} className="mb-2">
                {property.label} - {property.address.street}, {property.address.city}
              </li>
            ))}
          </ul>
        ) : (
          <p>No properties added.</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Assignments</h3>
        {assignments.length > 0 ? (
          <ul className="list-disc pl-5">
            {assignments.map((assignment) => {
              const owner = owners.find((o) => o.id === assignment.ownerId);
              const property = properties.find((p) => p.id === assignment.propertyId);

              return (
                <li key={`${assignment.ownerId}-${assignment.propertyId}`} className="mb-2">
                  {owner?.firstName} {owner?.lastName} - {property?.label} ({assignment.ownershipPercentage}%)
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No assignments added.</p>
        )}
      </div>

      <FormNavigation onNext={handleNext} submitText="Go to Submit" />
    </div>
  );
};

export default ReviewStep;

