
// Add this function at the appropriate place in propertyUtils.ts
export const normalizeActivityType = (activity: string): ActivityType => {
  if (activity === 'neither') {
    return 'owned_all_year';
  }
  return activity as ActivityType;
};

// Update createEmptyProperty function to use the new value
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
    activity2024: 'owned_all_year', // Updated from 'neither'
    propertyType: 'RESIDENTIAL',
    remodeling: false,
    occupancyStatuses: [
      { status: 'PERSONAL_USE', months: 12 }
    ]
  };
};

// Update handleActivityChange to use the new value where needed
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
