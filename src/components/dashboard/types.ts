
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment as BaseOwnerPropertyAssignment, 
  ActivityType, 
  PropertyType, 
  OccupancyAllocation, 
  MaritalStatus, 
  PropertyDocument,
  OccupancyStatus 
} from '@/types/form';

// Extend the OwnerPropertyAssignment type to include id (required for edit/delete operations)
export interface OwnerPropertyAssignment extends BaseOwnerPropertyAssignment {
  id: string; // Changed from optional to required since we need it for operations
}

export type {
  Owner,
  Property,
  ActivityType,
  PropertyType,
  OccupancyAllocation,
  MaritalStatus,
  PropertyDocument,
  OccupancyStatus
};
