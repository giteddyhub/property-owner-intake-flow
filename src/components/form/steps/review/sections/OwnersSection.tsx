
import React from 'react';
import { Owner } from '@/types/form';
import SectionHeader from '@/components/form/review/SectionHeader';
import OwnerReviewCard from '@/components/form/review/OwnerReviewCard';

interface OwnersSectionProps {
  owners: Owner[];
  onEditClick: () => void;
}

const OwnersSection: React.FC<OwnersSectionProps> = ({ owners, onEditClick }) => {
  return (
    <div className="mb-8">
      <SectionHeader title="Owners" onEditClick={onEditClick} />
      
      <div className="grid gap-4 md:grid-cols-2">
        {owners.map((owner) => (
          <OwnerReviewCard key={owner.id} owner={owner} />
        ))}
      </div>
    </div>
  );
};

export default OwnersSection;
