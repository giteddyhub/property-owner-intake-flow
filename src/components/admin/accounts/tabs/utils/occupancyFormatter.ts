
import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';

export const formatPropertyOccupancy = (occupancyStatuses: string[] | undefined): string => {
  if (!occupancyStatuses || occupancyStatuses.length === 0) {
    return 'Not specified';
  }

  try {
    // Handle different possible formats
    let parsedStatuses: any[] = [];

    if (Array.isArray(occupancyStatuses)) {
      parsedStatuses = occupancyStatuses.map((status) => {
        if (typeof status === 'string') {
          try {
            // Try to parse as JSON first
            return JSON.parse(status);
          } catch {
            // If JSON parsing fails, treat as a simple string value
            return { status: status, months: 0 };
          }
        } else if (typeof status === 'object' && status !== null) {
          return status;
        }
        return null;
      }).filter(Boolean);
    }

    // If we have valid allocation objects with status and months, use the utility function
    if (parsedStatuses.length > 0) {
      const validAllocations = parsedStatuses.filter(allocation => 
        allocation && 
        typeof allocation === 'object' && 
        ('status' in allocation || 'PERSONAL_USE' in allocation || 'LONG_TERM_RENT' in allocation || 'SHORT_TERM_RENT' in allocation)
      );

      if (validAllocations.length > 0) {
        // Check if it's the old format with direct status properties
        if ('PERSONAL_USE' in validAllocations[0] || 'LONG_TERM_RENT' in validAllocations[0] || 'SHORT_TERM_RENT' in validAllocations[0]) {
          // Convert old format to new format
          const converted = [];
          const allocation = validAllocations[0];
          if (allocation.PERSONAL_USE > 0) converted.push({ status: 'PERSONAL_USE', months: allocation.PERSONAL_USE });
          if (allocation.LONG_TERM_RENT > 0) converted.push({ status: 'LONG_TERM_RENT', months: allocation.LONG_TERM_RENT });
          if (allocation.SHORT_TERM_RENT > 0) converted.push({ status: 'SHORT_TERM_RENT', months: allocation.SHORT_TERM_RENT });
          
          return formatOccupancyStatuses(converted);
        } else {
          // Use the new format directly
          return formatOccupancyStatuses(validAllocations);
        }
      }
    }

    // Fallback: try to display whatever we have
    return occupancyStatuses.map(status => {
      if (typeof status === 'string') {
        return status;
      }
      return JSON.stringify(status);
    }).join(', ');

  } catch (error) {
    console.error('Error parsing occupancy statuses:', error);
    return 'Not specified';
  }
};
