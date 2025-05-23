
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, 
  OccupancyStatus,
  OccupancyAllocation 
} from '@/types/form';
import { PropertyFormContextType } from './PropertyFormTypes';
import { usePropertyFormHandlers } from './PropertyFormHandlers';

const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

export const PropertyFormProvider: React.FC<{
  property: Property;
  children: React.ReactNode;
}> = ({ property, children }) => {
  const [currentProperty, setCurrentProperty] = useState<Property>(property);
  const [activeStatuses, setActiveStatuses] = useState<Set<OccupancyStatus>>(new Set(['LONG_TERM_RENT']));
  const [occupancyMonths, setOccupancyMonths] = useState<Record<OccupancyStatus, number>>({
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 12,
    SHORT_TERM_RENT: 0,
  });
  const [availableMonths, setAvailableMonths] = useState<Record<OccupancyStatus, number[]>>({
    PERSONAL_USE: [],
    LONG_TERM_RENT: [],
    SHORT_TERM_RENT: [],
  });

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

  // Update property occupancy statuses when months change
  useEffect(() => {
    const newOccupancyStatuses: OccupancyAllocation[] = [];
    
    (Object.entries(occupancyMonths) as [OccupancyStatus, number][]).forEach(([status, months]) => {
      if (months > 0) {
        newOccupancyStatuses.push({ status, months });
      }
    });
    
    if (newOccupancyStatuses.length > 0) {
      setCurrentProperty(prev => ({
        ...prev,
        occupancyStatuses: newOccupancyStatuses
      }));
    }
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
