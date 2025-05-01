
import React from 'react';
import { occupancyExplanations } from './utils/propertyTypes';
import { usePropertyForm } from './context/PropertyFormContext';
import OccupancyStatusItem from './occupancy/OccupancyStatusItem';
import OccupancyProgressBar from './occupancy/OccupancyProgressBar';
import { Property } from '@/types/form';

const PropertyOccupancySection: React.FC = () => {
  const { 
    occupancyMonths,
    activeStatuses,
    availableMonths,
    totalMonthsAllocated,
    currentProperty,
    handleOccupancyStatusChange,
    handleOccupancyMonthsChange,
    handleRemoveOccupancyStatus
  } = usePropertyForm();
  
  // Handle clicks in the section to prevent propagation
  const handleSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div className="mt-6" onClick={handleSectionClick}>
      <h4 className="text-md font-medium mb-3">Rental Status in 2024*</h4>
      
      <OccupancyProgressBar totalMonthsAllocated={totalMonthsAllocated} />
      
      <div className="flex flex-col space-y-3">
        <OccupancyStatusItem 
          status="LONG_TERM_RENT"
          label="Long-Term Rental"
          isActive={activeStatuses.has('LONG_TERM_RENT') || occupancyMonths.LONG_TERM_RENT > 0}
          months={occupancyMonths.LONG_TERM_RENT}
          availableMonths={availableMonths.LONG_TERM_RENT}
          explanation={occupancyExplanations.LONG_TERM_RENT}
          onStatusChange={() => handleOccupancyStatusChange('LONG_TERM_RENT')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('LONG_TERM_RENT', months)}
          onRemove={() => handleRemoveOccupancyStatus('LONG_TERM_RENT')}
          currentProperty={currentProperty}
        />
        
        <OccupancyStatusItem 
          status="SHORT_TERM_RENT"
          label="Short-Term Rental"
          isActive={activeStatuses.has('SHORT_TERM_RENT') || occupancyMonths.SHORT_TERM_RENT > 0}
          months={occupancyMonths.SHORT_TERM_RENT}
          availableMonths={availableMonths.SHORT_TERM_RENT}
          explanation={occupancyExplanations.SHORT_TERM_RENT}
          onStatusChange={() => handleOccupancyStatusChange('SHORT_TERM_RENT')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('SHORT_TERM_RENT', months)}
          onRemove={() => handleRemoveOccupancyStatus('SHORT_TERM_RENT')}
          currentProperty={currentProperty}
        />
        
        <OccupancyStatusItem 
          status="PERSONAL_USE"
          label="Personal Use / Vacant"
          isActive={activeStatuses.has('PERSONAL_USE') || occupancyMonths.PERSONAL_USE > 0}
          months={occupancyMonths.PERSONAL_USE}
          availableMonths={availableMonths.PERSONAL_USE}
          explanation={occupancyExplanations.PERSONAL_USE}
          onStatusChange={() => handleOccupancyStatusChange('PERSONAL_USE')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('PERSONAL_USE', months)}
          onRemove={() => handleRemoveOccupancyStatus('PERSONAL_USE')}
          currentProperty={currentProperty}
        />
      </div>
    </div>
  );
};

export default PropertyOccupancySection;
