import React, { useCallback } from 'react';
import { 
  Property, 
  OccupancyStatus,
  ActivityType 
} from '@/types/form';
import { handleActivityChange } from '../utils/activityUtils';

export function usePropertyFormHandlers(
  currentProperty: Property,
  setCurrentProperty: React.Dispatch<React.SetStateAction<Property>>,
  occupancyMonths: Record<OccupancyStatus, number>,
  setOccupancyMonths: React.Dispatch<React.SetStateAction<Record<OccupancyStatus, number>>>,
  activeStatuses: Set<OccupancyStatus>,
  setActiveStatuses: React.Dispatch<React.SetStateAction<Set<OccupancyStatus>>>
) {
  // Input handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [setCurrentProperty]);

  // Select handler
  const handleSelectChange = useCallback((name: string, value: string) => {
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
  }, [setCurrentProperty]);

  // Activity type handler
  const handleActivityTypeChange = useCallback((value: ActivityType) => {
    setCurrentProperty(prev => handleActivityChange(prev, value));
  }, [setCurrentProperty]);

  // Date handlers
  const handlePurchaseDateChange = useCallback((date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, purchaseDate: date || null }));
  }, [setCurrentProperty]);

  const handleSaleDateChange = useCallback((date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, saleDate: date || null }));
  }, [setCurrentProperty]);

  // Remodeling handler
  const handleRemodelingChange = useCallback((checked: boolean) => {
    setCurrentProperty(prev => ({ ...prev, remodeling: checked }));
  }, [setCurrentProperty]);

  // Occupancy handlers
  const handleOccupancyStatusChange = useCallback((status: OccupancyStatus) => {
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
  }, [activeStatuses, occupancyMonths, setActiveStatuses]);

  const handleOccupancyMonthsChange = useCallback((status: OccupancyStatus, months: number) => {
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
  }, [setOccupancyMonths, setActiveStatuses]);

  const handleRemoveOccupancyStatus = useCallback((status: OccupancyStatus) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: 0
    }));
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.delete(status);
      return newStatuses;
    });
  }, [setOccupancyMonths, setActiveStatuses]);

  return {
    handleInputChange,
    handleSelectChange,
    handleActivityTypeChange,
    handlePurchaseDateChange,
    handleSaleDateChange,
    handleRemodelingChange,
    handleOccupancyStatusChange,
    handleOccupancyMonthsChange,
    handleRemoveOccupancyStatus
  };
}
