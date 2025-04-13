
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, 
  OccupancyStatus, 
  OccupancyAllocation 
} from '@/types/form';

interface PropertyFormContextType {
  currentProperty: Property;
  setCurrentProperty: React.Dispatch<React.SetStateAction<Property>>;
  occupancyMonths: Record<OccupancyStatus, number>;
  setOccupancyMonths: React.Dispatch<React.SetStateAction<Record<OccupancyStatus, number>>>;
  activeStatuses: Set<OccupancyStatus>;
  setActiveStatuses: React.Dispatch<React.SetStateAction<Set<OccupancyStatus>>>;
  availableMonths: Record<OccupancyStatus, number[]>;
  totalMonthsAllocated: number;
  shouldShowRentalIncome: boolean;
  handleOccupancyStatusChange: (status: OccupancyStatus) => void;
  handleOccupancyMonthsChange: (status: OccupancyStatus, months: number) => void;
  handleRemoveOccupancyStatus: (status: OccupancyStatus) => void;
  handleActivityTypeChange: (value: ActivityType) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handlePurchaseDateChange: (date: Date | undefined) => void;
  handleSaleDateChange: (date: Date | undefined) => void;
  handleRemodelingChange: (checked: boolean) => void;
}

import { ActivityType } from '@/types/form';
import { handleActivityChange } from './propertyUtils';

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

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      
      if (parentKey === 'address') {
        setCurrentProperty(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [childKey]: value
          }
        }));
      }
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      setCurrentProperty(prev => {
        if (name === 'address.province') {
          return {
            ...prev,
            address: {
              ...prev.address,
              province: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivityTypeChange = (value: ActivityType) => {
    setCurrentProperty(prev => handleActivityChange(prev, value));
  };

  const handlePurchaseDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, purchaseDate: date || null }));
  };

  const handleSaleDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, saleDate: date || null }));
  };

  const handleRemodelingChange = (checked: boolean) => {
    setCurrentProperty(prev => ({ ...prev, remodeling: checked }));
  };

  const handleOccupancyStatusChange = (status: OccupancyStatus) => {
    if (activeStatuses.has(status) && occupancyMonths[status] === 0) {
      setActiveStatuses(prev => {
        const newStatuses = new Set(prev);
        newStatuses.delete(status);
        return newStatuses;
      });
      
      return;
    }
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.add(status);
      return newStatuses;
    });
  };

  const handleOccupancyMonthsChange = (status: OccupancyStatus, months: number) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: months
    }));
    
    if (months > 0) {
      setActiveStatuses(prev => {
        const newStatuses = new Set(prev);
        newStatuses.add(status);
        return newStatuses;
      });
    }
  };

  const handleRemoveOccupancyStatus = (status: OccupancyStatus) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: 0
    }));
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.delete(status);
      return newStatuses;
    });
  };

  // Determine if rental income section should be shown
  const shouldShowRentalIncome = () => {
    return currentProperty.occupancyStatuses.some(
      allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
    ) || activeStatuses.has('LONG_TERM_RENT') || activeStatuses.has('SHORT_TERM_RENT') ||
    occupancyMonths.LONG_TERM_RENT > 0 || occupancyMonths.SHORT_TERM_RENT > 0;
  };

  const value = {
    currentProperty,
    setCurrentProperty,
    occupancyMonths,
    setOccupancyMonths,
    activeStatuses,
    setActiveStatuses,
    availableMonths,
    totalMonthsAllocated,
    shouldShowRentalIncome: shouldShowRentalIncome(),
    handleOccupancyStatusChange,
    handleOccupancyMonthsChange,
    handleRemoveOccupancyStatus,
    handleActivityTypeChange,
    handleInputChange,
    handleSelectChange,
    handlePurchaseDateChange,
    handleSaleDateChange,
    handleRemodelingChange
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
