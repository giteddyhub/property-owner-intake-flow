
import React from 'react';
import { Property } from '@/types/form';
import SectionHeader from '@/components/form/review/SectionHeader';
import PropertyReviewCard from '@/components/form/review/PropertyReviewCard';
import { Accordion } from "@/components/ui/accordion";

interface PropertiesSectionProps {
  properties: Property[];
  onEditClick: () => void;
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({ properties, onEditClick }) => {
  return (
    <div className="mb-8">
      <SectionHeader title="Properties" onEditClick={onEditClick} />
      
      <Accordion type="multiple" className="w-full space-y-4">
        {properties.map((property) => (
          <PropertyReviewCard 
            key={property.id} 
            property={property} 
            onEditClick={onEditClick} 
          />
        ))}
      </Accordion>
    </div>
  );
};

export default PropertiesSection;
