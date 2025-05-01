
import { OwnerPropertyAssignment } from '@/components/dashboard/types';
import { DbAssignment } from '../types';

export const mapDbAssignmentsToAssignments = (dbAssignments: DbAssignment[]): OwnerPropertyAssignment[] => {
  return dbAssignments.map((dbAssignment: DbAssignment): OwnerPropertyAssignment => ({
    id: dbAssignment.id,
    propertyId: dbAssignment.property_id,
    ownerId: dbAssignment.owner_id,
    ownershipPercentage: Number(dbAssignment.ownership_percentage),
    residentAtProperty: dbAssignment.resident_at_property,
    residentDateRange: dbAssignment.resident_from_date ? {
      from: new Date(dbAssignment.resident_from_date),
      to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
    } : undefined,
    taxCredits: dbAssignment.tax_credits ? Number(dbAssignment.tax_credits) : undefined,
    userId: dbAssignment.user_id
  }));
};
