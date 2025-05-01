
import { supabase } from '@/integrations/supabase/client';
import { OwnerPropertyAssignment } from '@/types/form';

/**
 * Save owner-property assignments
 */
export const saveAssignments = async (
  assignments: OwnerPropertyAssignment[],
  ownerIdMap: Record<string, string>,
  propertyIdMap: Record<string, string>,
  contactId: string,
  userId: string | null = null
) => {
  try {
    console.log(`Saving ${assignments.length} assignments with contactId:`, contactId);
    
    if (assignments.length === 0) {
      return;
    }
    
    // Process each assignment
    for (const assignment of assignments) {
      // Get corresponding database IDs
      const dbOwnerId = ownerIdMap[assignment.ownerId];
      const dbPropertyId = propertyIdMap[assignment.propertyId];
      
      if (!dbOwnerId || !dbPropertyId) {
        console.error('Missing mapped ID:', {
          originalOwnerId: assignment.ownerId,
          originalPropertyId: assignment.propertyId,
          mappedOwnerId: dbOwnerId,
          mappedPropertyId: dbPropertyId
        });
        throw new Error('Failed to map assignment IDs');
      }
      
      // Format dates for residence date range
      const residentFromDate = assignment.residentDateRange?.from instanceof Date
        ? assignment.residentDateRange.from.toISOString().split('T')[0]
        : assignment.residentDateRange?.from
          ? new Date(assignment.residentDateRange.from).toISOString().split('T')[0]
          : null;
      
      const residentToDate = assignment.residentDateRange?.to instanceof Date
        ? assignment.residentDateRange.to.toISOString().split('T')[0]
        : assignment.residentDateRange?.to
          ? new Date(assignment.residentDateRange.to).toISOString().split('T')[0]
          : null;
      
      // Map from form model to database model
      const dbAssignment = {
        owner_id: dbOwnerId,
        property_id: dbPropertyId,
        ownership_percentage: assignment.ownershipPercentage,
        resident_at_property: assignment.residentAtProperty,
        resident_from_date: residentFromDate,
        resident_to_date: residentToDate,
        tax_credits: assignment.taxCredits,
        contact_id: contactId,
        user_id: userId,  // Ensure user_id is set when available
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Inserting assignment:", dbAssignment);
      
      // Insert into database
      const { error } = await supabase
        .from('owner_property_assignments')
        .insert(dbAssignment);
      
      if (error) {
        console.error('Error saving assignment:', error);
        throw new Error(`Failed to save assignment: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in saveAssignments:', error);
    throw error;
  }
};
