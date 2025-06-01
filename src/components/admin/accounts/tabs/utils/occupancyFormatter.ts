

import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';
import { OccupancyStatus } from '@/types/form';

export const formatPropertyOccupancy = (occupancyStatuses: string[] | undefined): string => {
  console.log('[occupancyFormatter] 🔍 Input data:', occupancyStatuses);
  
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
            const parsed = JSON.parse(status);
            console.log('[occupancyFormatter] 📦 Parsed JSON:', parsed);
            
            // Handle nested array structure: [[{...}]] → [{...}]
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (Array.isArray(parsed[0])) {
                // Double nested: [[{...}]] → [{...}]
                console.log('[occupancyFormatter] 🔄 Flattening double-nested array');
                return parsed[0]; // Take the inner array
              } else {
                // Single nested: [{...}]
                return parsed;
              }
            }
            
            return parsed;
          } catch {
            // If JSON parsing fails, treat as a simple string value with 0 months
            return { status: status, months: 0 };
          }
        } else if (typeof status === 'object' && status !== null) {
          console.log('[occupancyFormatter] 📦 Object status:', status);
          
          // Handle nested array within object: {0: [{...}]}
          if (Array.isArray(status)) {
            return status;
          }
          
          // Handle object with numeric keys containing arrays
          const keys = Object.keys(status);
          if (keys.length > 0 && Array.isArray(status[keys[0]])) {
            console.log('[occupancyFormatter] 🔄 Extracting from numeric key array');
            return status[keys[0]]; // Return the array value
          }
          
          return status;
        }
        return null;
      }).filter(Boolean);
    }

    console.log('[occupancyFormatter] 🎯 Parsed statuses before flattening:', parsedStatuses);

    // Flatten any remaining nested arrays
    const flattenedStatuses = parsedStatuses.flat(2); // Flatten up to 2 levels deep
    console.log('[occupancyFormatter] 🎯 Flattened statuses:', flattenedStatuses);

    // If we have valid allocation objects with status and months, use the utility function
    if (flattenedStatuses.length > 0) {
      const validAllocations = flattenedStatuses.filter(allocation => 
        allocation && 
        typeof allocation === 'object' && 
        ('status' in allocation || 'PERSONAL_USE' in allocation || 'LONG_TERM_RENT' in allocation || 'SHORT_TERM_RENT' in allocation)
      );

      console.log('[occupancyFormatter] ✅ Valid allocations:', validAllocations);

      if (validAllocations.length > 0) {
        // Check if it's the old format with direct status properties
        if ('PERSONAL_USE' in validAllocations[0] || 'LONG_TERM_RENT' in validAllocations[0] || 'SHORT_TERM_RENT' in validAllocations[0]) {
          // Convert old format to new format
          const converted = [];
          const allocation = validAllocations[0];
          if (allocation.PERSONAL_USE > 0) converted.push({ status: 'PERSONAL_USE' as OccupancyStatus, months: allocation.PERSONAL_USE });
          if (allocation.LONG_TERM_RENT > 0) converted.push({ status: 'LONG_TERM_RENT' as OccupancyStatus, months: allocation.LONG_TERM_RENT });
          if (allocation.SHORT_TERM_RENT > 0) converted.push({ status: 'SHORT_TERM_RENT' as OccupancyStatus, months: allocation.SHORT_TERM_RENT });
          
          console.log('[occupancyFormatter] 🔄 Converted old format:', converted);
          return formatOccupancyStatuses(converted);
        } else {
          // Ensure all allocations have both status and months properties
          const normalizedAllocations = validAllocations.map(allocation => {
            if ('status' in allocation && 'months' in allocation) {
              console.log('[occupancyFormatter] ✅ Valid allocation with months:', allocation);
              return allocation;
            }
            // If missing months, default to 0
            console.log('[occupancyFormatter] ⚠️ Missing months, defaulting to 0:', allocation);
            return { status: allocation.status || 'PERSONAL_USE', months: allocation.months || 0 };
          });
          
          console.log('[occupancyFormatter] 🎯 Final normalized allocations:', normalizedAllocations);
          return formatOccupancyStatuses(normalizedAllocations);
        }
      }
    }

    // Enhanced fallback: try to create proper status objects with months
    const fallbackStatuses = occupancyStatuses.map(status => {
      if (typeof status === 'string') {
        // Try to extract status information and create a proper object with valid OccupancyStatus
        if (status.includes('PERSONAL_USE')) {
          return { status: 'PERSONAL_USE' as OccupancyStatus, months: 0 };
        }
        if (status.includes('LONG_TERM_RENT')) {
          return { status: 'LONG_TERM_RENT' as OccupancyStatus, months: 0 };
        }
        if (status.includes('SHORT_TERM_RENT')) {
          return { status: 'SHORT_TERM_RENT' as OccupancyStatus, months: 0 };
        }
        // Default case - use PERSONAL_USE as fallback for unknown statuses
        return { status: 'PERSONAL_USE' as OccupancyStatus, months: 0 };
      }
      return { status: 'PERSONAL_USE' as OccupancyStatus, months: 0 };
    });

    console.log('[occupancyFormatter] 🔧 Using fallback statuses:', fallbackStatuses);
    
    // Use the utility function even for fallback cases
    return formatOccupancyStatuses(fallbackStatuses);

  } catch (error) {
    console.error('[occupancyFormatter] ❌ Error parsing occupancy statuses:', error);
    return 'Not specified';
  }
};

