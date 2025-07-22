
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, 
  OccupancyStatus,
  OccupancyAllocation 
} from '@/types/form';
import { PropertyFormContextType } from './PropertyFormTypes';
import { usePropertyFormHandlers } from './PropertyFormHandlers';
import { getOccupancyData, validateOccupancyAllocations } from '../utils/occupancyUtils';

const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

export const PropertyFormProvider: React.FC<{
  property: Property;
  children: React.ReactNode;
}> = ({ property, children }) => {
  const [currentProperty, setCurrentProperty] = useState<Property>(property);
  
  // Initialize occupancy data using the enhanced validation utility
  const { initialOccupancyMonths, newActiveStatuses, validatedAllocations } = getOccupancyData(property);
  
  const [activeStatuses, setActiveStatuses] = useState<Set<OccupancyStatus>>(newActiveStatuses);
  const [occupancyMonths, setOccupancyMonths] = useState<Record<OccupancyStatus, number>>(initialOccupancyMonths);
  const [availableMonths, setAvailableMonths] = useState<Record<OccupancyStatus, number[]>>({
    PERSONAL_USE: [],
    LONG_TERM_RENT: [],
    SHORT_TERM_RENT: [],
  });

  // Sync state when property prop changes (for when reopening forms)
  useEffect(() => {
    console.log('[PropertyFormProvider] Property changed, reinitializing state', property);
    setCurrentProperty(property);
    
    const { initialOccupancyMonths: newOccupancyMonths, newActiveStatuses: newStatuses } = getOccupancyData(property);
    setOccupancyMonths(newOccupancyMonths);
    setActiveStatuses(newStatuses);
  }, [property.id, property.occupancyStatuses]); // React to changes in property ID or occupancy statuses

  // Calculate total months allocated
  const totalMonthsAllocated = Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);

  // Get all handlers from the custom hook
  const handlers = usePropertyFormHandlers(
    currentProperty,
    setCurrentProperty,
    occupancyMonths,
    setOccupancyMonths,
    activeStatuses,
    setActiveStatuses
  );

  // Update available months whenever occupancy months change
  useEffect(() => {
    const totalMonthsUsed = Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);
    const remainingMonths = 12 - totalMonthsUsed;
    
    const newAvailableMonths: Record<OccupancyStatus, number[]> = {
      PERSONAL_USE: [],
      LONG_TERM_RENT: [],
      SHORT_TERM_RENT: [],
    };
    
    Object.keys(newAvailableMonths).forEach((status) => {
      const statusKey = status as OccupancyStatus;
      const currentValue = occupancyMonths[statusKey];
      const maxAvailable = remainingMonths + currentValue;
      
      if (maxAvailable > 0) {
        newAvailableMonths[statusKey] = Array.from(
          { length: maxAvailable }, 
          (_, i) => i + 1
        );
      } else {
        newAvailableMonths[statusKey] = [];
      }
    });
    
    setAvailableMonths(newAvailableMonths);
  }, [occupancyMonths]);

  // Update property occupancy statuses when months change with validation
  useEffect(() => {
    const newOccupancyStatuses: OccupancyAllocation[] = [];
    
    (Object.entries(occupancyMonths) as [OccupancyStatus, number][]).forEach(([status, months]) => {
      if (months > 0) {
        newOccupancyStatuses.push({ status, months });
      }
    });
    
    // Validate the new occupancy statuses before setting them
    const validatedStatuses = validateOccupancyAllocations(newOccupancyStatuses);
    
    console.log('[PropertyFormProvider] Updating currentProperty with validated occupancy statuses:', validatedStatuses);
    
    setCurrentProperty(prev => ({
      ...prev,
      occupancyStatuses: validatedStatuses
    }));
  }, [occupancyMonths]);

  // Determine if rental income section should be shown
  const shouldShowRentalIncome = currentProperty.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  ) || activeStatuses.has('LONG_TERM_RENT') || activeStatuses.has('SHORT_TERM_RENT') ||
  occupancyMonths.LONG_TERM_RENT > 0 || occupancyMonths.SHORT_TERM_RENT > 0;

  const value = {
    currentProperty,
    setCurrentProperty,
    occupancyMonths,
    setOccupancyMonths,
    activeStatuses,
    setActiveStatuses,
    availableMonths,
    totalMonthsAllocated,
    shouldShowRentalIncome,
    ...handlers
  };

  return (
    <PropertyFormContext.Provider value={value}>
      {children}
    </PropertyFormContext.Provider>
  );
};

export const usePropertyForm = () => {
  const context = useContext(PropertyFormContext);
  if (!context) {
    throw new Error('usePropertyForm must be used within a PropertyFormProvider');
  }
  return context;
};
