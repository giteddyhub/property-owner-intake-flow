
import { Property, OccupancyStatus, OccupancyAllocation } from '@/types/form';

// Validate and normalize occupancy allocations
export const validateOccupancyAllocations = (allocations: OccupancyAllocation[]): OccupancyAllocation[] => {
  console.log('[validateOccupancyAllocations] Input allocations:', allocations);
  
  if (!Array.isArray(allocations)) {
    console.warn('[validateOccupancyAllocations] Invalid input, returning default PERSONAL_USE');
    return [{ status: 'PERSONAL_USE', months: 12 }];
  }

  const validated = allocations.map((allocation, index) => {
    const normalized: OccupancyAllocation = {
      status: allocation?.status || 'PERSONAL_USE',
      months: typeof allocation?.months === 'number' ? Math.max(0, Math.min(12, allocation.months)) : 0
    };
    
    console.log(`[validateOccupancyAllocations] Allocation ${index}: ${JSON.stringify(allocation)} -> ${JSON.stringify(normalized)}`);
    return normalized;
  }).filter(allocation => allocation.months > 0); // Remove zero-month allocations

  // If no valid allocations, default to PERSONAL_USE for 12 months
  if (validated.length === 0) {
    console.log('[validateOccupancyAllocations] No valid allocations found, using default');
    return [{ status: 'PERSONAL_USE', months: 12 }];
  }

  console.log('[validateOccupancyAllocations] Final validated allocations:', validated);
  return validated;
};

// Get occupancy data with proper validation
export const getOccupancyData = (property: Property) => {
  console.log('[getOccupancyData] Processing property:', property);
  
  // Validate and normalize occupancy statuses
  const validatedAllocations = validateOccupancyAllocations(property.occupancyStatuses || []);
  
  const initialOccupancyMonths: Record<OccupancyStatus, number> = {
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 0,
    SHORT_TERM_RENT: 0,
  };

  const newActiveStatuses = new Set<OccupancyStatus>();

  // Process validated allocations
  validatedAllocations.forEach((allocation) => {
    if (allocation.months > 0) {
      initialOccupancyMonths[allocation.status] = allocation.months;
      newActiveStatuses.add(allocation.status);
    }
  });

  console.log('[getOccupancyData] Result:', {
    initialOccupancyMonths,
    activeStatuses: Array.from(newActiveStatuses),
    validatedAllocations
  });

  return {
    initialOccupancyMonths,
    newActiveStatuses,
    validatedAllocations
  };
};

// Calculate total months from occupancy allocations
export const calculateTotalMonths = (allocations: OccupancyAllocation[]): number => {
  return allocations.reduce((total, allocation) => total + (allocation.months || 0), 0);
};

// Check if occupancy data is valid (total months = 12)
export const isOccupancyDataValid = (allocations: OccupancyAllocation[]): boolean => {
  const total = calculateTotalMonths(allocations);
  return total === 12;
};

// Format individual occupancy status
export const formatOccupancyStatus = (status: OccupancyStatus): string => {
  switch (status) {
    case 'PERSONAL_USE':
      return 'Personal Use';
    case 'LONG_TERM_RENT':
      return 'Long-term Rent';
    case 'SHORT_TERM_RENT':
      return 'Short-term Rent';
    default:
      // This should never happen with proper OccupancyStatus typing, but adding fallback
      return String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
};

// Format occupancy statuses for display
export const formatOccupancyStatuses = (allocations: OccupancyAllocation[]): string => {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return 'Not specified';
  }

  const validAllocations = validateOccupancyAllocations(allocations);
  
  if (validAllocations.length === 0) {
    return 'Not specified';
  }

  const statusTexts = validAllocations
    .filter(allocation => allocation.months > 0)
    .map(allocation => {
      const statusText = formatOccupancyStatus(allocation.status);
      return `${statusText} (${allocation.months} month${allocation.months > 1 ? 's' : ''})`;
    });

  return statusTexts.length > 0 ? statusTexts.join(', ') : 'Not specified';
};
