
import { supabase } from '@/integrations/supabase/client';
import { OwnerPropertyAssignment } from '@/types/form';

export const saveAssignments = async (
  assignments: OwnerPropertyAssignment[],
  ownerIdMap: Map<string, string>,
  propertyIdMap: Map<string, string>,
  contactId: string,
  userId: string | null = null
): Promise<void> => {
  // Process each assignment
  for (const assignment of assignments) {
    // Get the database IDs for owner and property
    const dbOwnerId = ownerIdMap.get(assignment.ownerId);
    const dbPropertyId = propertyIdMap.get(assignment.propertyId);
    
    if (!dbOwnerId || !dbPropertyId) {
      console.error("Could not find database ID for assignment", assignment);
      throw new Error("Missing database ID for owner or property");
    }
    
    console.log(`Saving assignment: Owner ${dbOwnerId} - Property ${dbPropertyId} - User ${userId}`);
    
    const { error } = await supabase
      .from('owner_property_assignments')
      .insert({
        owner_id: dbOwnerId,
        property_id: dbPropertyId,
        ownership_percentage: assignment.ownershipPercentage,
        resident_at_property: assignment.residentAtProperty,
        resident_from_date: assignment.residentDateRange?.from ? 
          assignment.residentDateRange.from.toISOString().split('T')[0] : null,
        resident_to_date: assignment.residentDateRange?.to ? 
          assignment.residentDateRange.to.toISOString().split('T')[0] : null,
        tax_credits: assignment.taxCredits,
        contact_id: contactId,
        user_id: userId
      });
      
    if (error) {
      console.error("Error saving assignment:", error);
      throw new Error(`Error saving assignment: ${error.message}`);
    }
  }
  
  console.log(`Successfully saved ${assignments.length} assignments`);
};
