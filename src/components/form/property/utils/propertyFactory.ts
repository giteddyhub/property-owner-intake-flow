
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
      { status: 'PERSONAL_USE', months: 12 } // Default to personal use, not long-term rent
    ],
    documents: [],
    useDocumentRetrievalService: false
  };
};

// Initialize occupancy data from property - ensures we read actual data instead of defaults
export const initializeOccupancyData = (property: Property): { initialOccupancyMonths: Record<string, number>, newActiveStatuses: Set<string> } => {
  console.log('initializeOccupancyData: Property input:', property);
  
  const initialOccupancyMonths: Record<string, number> = {
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 0,
    SHORT_TERM_RENT: 0,
  };

  const newActiveStatuses: Set<string> = new Set();

  if (Array.isArray(property.occupancyStatuses) && property.occupancyStatuses.length > 0) {
    property.occupancyStatuses.forEach(item => {
      if (typeof item === 'object' && 'status' in item && 'months' in item) {
        initialOccupancyMonths[item.status] = item.months;
        if (item.months > 0) {
          newActiveStatuses.add(item.status);
        }
      }
    });
  } else {
    // If no occupancy statuses, default to personal use for 12 months
    initialOccupancyMonths.PERSONAL_USE = 12;
    newActiveStatuses.add('PERSONAL_USE');
  }

  console.log('initializeOccupancyData: Result:', { initialOccupancyMonths, newActiveStatuses });

  return { initialOccupancyMonths, newActiveStatuses };
};
