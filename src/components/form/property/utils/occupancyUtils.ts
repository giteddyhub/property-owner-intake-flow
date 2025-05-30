
import { OccupancyStatus, OccupancyAllocation, Property } from '@/types/form';

// Function to format occupancy statuses for display
export const formatOccupancyStatuses = (allocations: OccupancyAllocation[]): string => {
  if (!allocations || allocations.length === 0) {
    return 'Not specified';
  }
  
  // Filter out any invalid allocations that might be causing undefined issues
  const validAllocations = allocations.filter(
    allocation => allocation && typeof allocation === 'object' && 'status' in allocation && 'months' in allocation
  );
  
  if (validAllocations.length === 0) {
    return 'Not specified';
  }
  
  if (validAllocations.length === 1) {
    const allocation = validAllocations[0];
    return `${formatOccupancyStatus(allocation.status)} (${allocation.months} months)`;
  }
  
  return validAllocations
    .map(allocation => `${formatOccupancyStatus(allocation.status)} (${allocation.months} months)`)
    .join(', ');
};

// Function to format an individual occupancy status for display
export const formatOccupancyStatus = (status: OccupancyStatus | undefined | null): string => {
  if (!status) return 'Unknown';
  
  switch (status) {
    case 'PERSONAL_USE':
      return 'Personal Use';
    case 'LONG_TERM_RENT':
      return 'Long-term Rental';
    case 'SHORT_TERM_RENT':
      return 'Short-term Rental';
    default:
      // Fix: Convert to string safely since TypeScript infers 'never' type for default case
      return String(status);
  }
};

// Renamed from getInitialOccupancyMonths to getOccupancyData to avoid conflicts
export const getOccupancyData = (property: Property) => {
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
