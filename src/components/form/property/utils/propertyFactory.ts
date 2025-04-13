
import { v4 as uuidv4 } from 'uuid';
import { Property } from '@/types/form';

// Function to create an empty property with default values
export const createEmptyProperty = (): Property => {
  return {
    id: uuidv4(),
    label: '',
    address: {
      comune: '',
      province: '',
      street: '',
      zip: ''
    },
    activity2024: 'owned_all_year', 
    propertyType: 'RESIDENTIAL',
    remodeling: false,
    occupancyStatuses: [
      { status: 'PERSONAL_USE', months: 12 }
    ]
  };
};
