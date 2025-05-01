
import { OwnerPropertyAssignment } from '@/components/dashboard/types';

interface DbAssignment {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  resident_from_date?: string;
  resident_to_date?: string;
  tax_credits?: number;
}

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
    taxCredits: dbAssignment.tax_credits ? Number(dbAssignment.tax_credits) : undefined
  }));
};
