
import { supabase } from '@/integrations/supabase/client';
import { OwnerPropertyAssignment } from '@/types/form';

/**
 * Save owner-property assignments
 */
export const saveAssignments = async (
  assignments: OwnerPropertyAssignment[],
  ownerIdMap: Record<string, string>,
  propertyIdMap: Record<string, string>,
  formSubmissionId: string,
  userId: string | null = null
) => {
  try {
    console.log(`Saving ${assignments.length} assignments with formSubmissionId:`, formSubmissionId);
    
    if (assignments.length === 0) {
      return;
    }
    
    if (!userId) {
      console.error('No user ID provided to saveAssignments');
      throw new Error('User ID is required to save assignments');
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
          mappedPropertyId: dbPropertyId,
          ownerIdMap,
          propertyIdMap
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
        ownership_percentage: assignment.ownershipPercentage || 0,
        resident_at_property: Boolean(assignment.residentAtProperty),
        resident_from_date: residentFromDate,
        resident_to_date: residentToDate,
        tax_credits: assignment.taxCredits || null,
        form_submission_id: formSubmissionId,
        user_id: userId,
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
