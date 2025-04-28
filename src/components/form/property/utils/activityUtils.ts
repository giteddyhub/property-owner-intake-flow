
import { Property, ActivityType } from '@/types/form';

// Normalize legacy 'neither' value to 'owned_all_year'
export const normalizeActivityType = (activity: string | ActivityType): ActivityType => {
  if (activity === 'neither') {
    return 'owned_all_year';
  }
  return activity as ActivityType;
};

// Function to format activity types for display
export const formatActivityType = (activity: string): string => {
  switch (activity) {
    case 'owned_all_year':
      return 'Owned all year';
    case 'purchased':
      return 'Purchased in 2024';
    case 'sold':
      return 'Sold in 2024';
    case 'both':
      return 'Purchased & Sold in 2024';
    default:
      return activity.charAt(0).toUpperCase() + activity.slice(1).replace(/_/g, ' ');
  }
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
