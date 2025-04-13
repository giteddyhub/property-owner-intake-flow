
import { Property, PropertyAddress, ActivityType, OccupancyAllocation } from '@/types/form';
import { v4 as uuidv4 } from 'uuid';

export const createEmptyProperty = (): Property => {
  return {
    id: uuidv4(),
    label: '',
    address: {
      street: '',
      comune: '',
      province: '',
      zip: ''
    },
    propertyType: 'RESIDENTIAL',
    activity2024: 'owned_all_year',
    remodeling: false,
    occupancyStatuses: [
      { status: 'LONG_TERM_RENT', months: 12 }
    ],
    documents: [],
    useDocumentRetrievalService: false
  };
};

// Renamed from getInitialOccupancyMonths to initializeOccupancyData to avoid conflict
export const initializeOccupancyData = (property: Property): { initialOccupancyMonths: Record<string, number>, newActiveStatuses: Set<string> } => {
  const initialOccupancyMonths: Record<string, number> = {
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 0,
    SHORT_TERM_RENT: 0,
  };

  const newActiveStatuses: Set<string> = new Set();

  if (Array.isArray(property.occupancyStatuses)) {
    property.occupancyStatuses.forEach(item => {
      initialOccupancyMonths[item.status] = item.months;
      newActiveStatuses.add(item.status);
    });
  }

  return { initialOccupancyMonths, newActiveStatuses };
};
