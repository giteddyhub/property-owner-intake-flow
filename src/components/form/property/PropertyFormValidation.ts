
import { Property, OccupancyStatus } from '@/types/form';

export const validatePropertySubmission = (
  property: Property, 
  totalMonths: number
): string | null => {
  if (!property.label) {
    return 'Please provide a property name';
  }
  
  if (!property.address.comune || !property.address.province || !property.address.street || !property.address.zip) {
    return 'Please complete all address fields';
  }
  
  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      return 'Please specify the purchase date';
    }
    if (property.purchasePrice === undefined || property.purchasePrice <= 0) {
      return 'Please specify a valid purchase price';
    }
  }
  
  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      return 'Please specify the sale date';
    }
    if (property.salePrice === undefined || property.salePrice <= 0) {
      return 'Please specify a valid sale price';
    }
  }
  
  if (totalMonths !== 12) {
    return 'The total months allocated must equal 12';
  }
  
  // Check if any rental status is selected and rental income is provided
  const hasRentalStatus = property.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  );
  
  if (hasRentalStatus && (property.rentalIncome === undefined || property.rentalIncome <= 0)) {
    return 'Please provide the rental income for 2024';
  }
  
  return null;
};
