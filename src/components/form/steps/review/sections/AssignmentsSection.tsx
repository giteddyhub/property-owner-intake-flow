
import React from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import SectionHeader from '@/components/form/review/SectionHeader';
import AssignmentReviewCard from '@/components/form/review/AssignmentReviewCard';

interface AssignmentsSectionProps {
  properties: Property[];
  owners: Owner[];
  assignments: OwnerPropertyAssignment[];
  onEditClick: () => void;
}

const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({ 
  properties, 
  owners, 
  assignments, 
  onEditClick 
}) => {
  return (
    <div className="mb-8">
      <SectionHeader title="Owner-Property Assignments" onEditClick={onEditClick} />
      
      <div className="space-y-4">
        {properties.map((property) => {
          const propertyAssignments = assignments.filter(assignment => assignment.propertyId === property.id);
          const totalPercentage = propertyAssignments.reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
          
          if (propertyAssignments.length === 0) {
            return null;
          }
          
          return (
            <AssignmentReviewCard 
              key={property.id}
              property={property}
              propertyAssignments={propertyAssignments}
              totalPercentage={totalPercentage}
              getOwnerById={(id) => owners.find(owner => owner.id === id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsSection;
