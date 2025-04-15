
import { supabase } from '@/integrations/supabase/client';
import { OwnerPropertyAssignment } from '@/types/form';

export const saveAssignments = async (
  assignments: OwnerPropertyAssignment[],
  propertyIdMap: Map<string, string>,
  ownerIdMap: Map<string, string>,
  contactId: string
): Promise<void> => {
  console.log("ID Mappings for assignments:", {
    owners: Array.from(ownerIdMap.entries()),
    properties: Array.from(propertyIdMap.entries())
  });
  
  for (const assignment of assignments) {
    const newPropertyId = propertyIdMap.get(assignment.propertyId);
    const newOwnerId = ownerIdMap.get(assignment.ownerId);
    
    if (!newPropertyId || !newOwnerId) {
      console.error('Could not find DB ID mapping for:', { 
        propertyId: assignment.propertyId,
        ownerId: assignment.ownerId,
        maps: { 
          properties: Array.from(propertyIdMap.entries()),
          owners: Array.from(ownerIdMap.entries())
        }
      });
      throw new Error('Failed to map local IDs to database IDs');
    }
    
    console.log("Saving assignment with mapped IDs:", {
      originalPropertyId: assignment.propertyId,
      newPropertyId,
      originalOwnerId: assignment.ownerId,
      newOwnerId
    });
    
    const insertData = {
      property_id: newPropertyId,
      owner_id: newOwnerId,
      ownership_percentage: assignment.ownershipPercentage,
      resident_at_property: assignment.residentAtProperty,
      resident_from_date: assignment.residentDateRange?.from 
        ? assignment.residentDateRange.from.toISOString().split('T')[0]
        : null,
      resident_to_date: assignment.residentDateRange?.to
        ? assignment.residentDateRange.to.toISOString().split('T')[0]
        : null,
      tax_credits: assignment.taxCredits,
      contact_id: contactId
    };
    
    console.log("Assignment data to insert:", insertData);
    
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('owner_property_assignments')
      .insert(insertData)
      .select();
      
    if (assignmentError) {
      console.error("Error saving assignment:", assignmentError);
      throw new Error(`Error saving assignment: ${assignmentError.message}`);
    }
  }
};
