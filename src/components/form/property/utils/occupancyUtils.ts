
import { OccupancyStatus, OccupancyAllocation, Property } from '@/types/form';

// Function to format occupancy statuses for display
export const formatOccupancyStatuses = (allocations: OccupancyAllocation[]): string => {
  if (!allocations || allocations.length === 0) {
    return 'Not specified';
  }
  
  if (allocations.length === 1) {
    return formatOccupancyStatus(allocations[0].status) + ` (${allocations[0].months} months)`;
  }
  
  return allocations
    .map(allocation => `${formatOccupancyStatus(allocation.status)} (${allocation.months} months)`)
    .join(', ');
};

// Function to format an individual occupancy status for display
export const formatOccupancyStatus = (status: OccupancyStatus): string => {
  switch (status) {
    case 'PERSONAL_USE':
      return 'Personal Use';
    case 'LONG_TERM_RENT':
      return 'Long-term Rental';
    case 'SHORT_TERM_RENT':
      return 'Short-term Rental';
    default:
      return status;
  }
};

// Function to get initial occupancy months based on existing property data
export const getInitialOccupancyMonths = (property: Property) => {
  const initialOccupancyMonths: Record<OccupancyStatus, number> = {
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 0,
    SHORT_TERM_RENT: 0,
  };

  const newActiveStatuses = new Set<OccupancyStatus>();
  
  if (Array.isArray(property.occupancyStatuses)) {
    property.occupancyStatuses.forEach(allocation => {
      if (typeof allocation === 'object' && 'status' in allocation && 'months' in allocation) {
        initialOccupancyMonths[allocation.status] = allocation.months;
        newActiveStatuses.add(allocation.status);
      }
    });
  }
  
  return { initialOccupancyMonths, newActiveStatuses };
};
