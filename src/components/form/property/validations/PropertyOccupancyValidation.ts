
import { Property, OccupancyStatus } from '@/types/form';

/**
 * Validates the occupancy allocations total months
 * @param totalMonths Total months allocated across all statuses
 * @returns Error message or null if valid
 */
export const validateOccupancyMonths = (totalMonths: number): string | null => {
  if (totalMonths !== 12) {
    return 'The total months allocated must equal 12';
  }
  
  return null;
};

/**
 * Validates the rental income if property has rental status
 * @param property The property to validate
 * @returns Error message or null if valid
 */
export const validateRentalIncome = (property: Property): string | null => {
  // Check if any rental status is selected and rental income is provided
  const hasRentalStatus = property.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  );
  
  if (hasRentalStatus && (property.rentalIncome === undefined || property.rentalIncome <= 0)) {
    return 'Please provide the rental income for 2024';
  }
  
  return null;
};
