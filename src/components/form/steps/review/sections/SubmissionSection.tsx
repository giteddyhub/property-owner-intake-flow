
import React from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import SubmissionSummary from '@/components/form/review/SubmissionSummary';

interface SubmissionSectionProps {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

const SubmissionSection: React.FC<SubmissionSectionProps> = ({
  owners,
  properties,
  assignments
}) => {
  return (
    <SubmissionSummary 
      owners={owners} 
      properties={properties} 
      assignments={assignments}
    />
  );
};

export default SubmissionSection;
