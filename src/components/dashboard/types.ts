
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

// Extend the OwnerPropertyAssignment type to include id and userId
export interface OwnerPropertyAssignment extends BaseOwnerPropertyAssignment {
  id?: string;
  userId?: string;
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
