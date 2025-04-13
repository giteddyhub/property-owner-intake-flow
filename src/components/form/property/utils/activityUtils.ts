
import { Property, ActivityType } from '@/types/form';

// Normalize legacy 'neither' value to 'owned_all_year'
export const normalizeActivityType = (activity: string | ActivityType): ActivityType => {
  if (activity === 'neither') {
    return 'owned_all_year';
  }
  return activity as ActivityType;
};

// Function to handle activity type changes
export const handleActivityChange = (property: Property, newActivity: ActivityType): Property => {
  const updatedProperty = { ...property, activity2024: newActivity };
  
  // Reset certain fields based on activity type
  if (newActivity === 'owned_all_year') {
    updatedProperty.purchaseDate = null;
    updatedProperty.purchasePrice = undefined;
    updatedProperty.saleDate = null;
    updatedProperty.salePrice = undefined;
  } else if (newActivity === 'purchased') {
    updatedProperty.saleDate = null;
    updatedProperty.salePrice = undefined;
  } else if (newActivity === 'sold') {
    updatedProperty.purchaseDate = null;
    updatedProperty.purchasePrice = undefined;
  }
  
  return updatedProperty;
};
