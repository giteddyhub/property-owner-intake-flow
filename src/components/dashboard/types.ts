
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

// Extend the OwnerPropertyAssignment type to include id
export interface OwnerPropertyAssignment extends BaseOwnerPropertyAssignment {
  id?: string;
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
