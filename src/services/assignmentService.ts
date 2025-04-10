
import { supabase } from "@/integrations/supabase/client";
import { OwnerPropertyAssignment } from "@/types/form";

export const assignmentService = {
  // Create a new assignment
  async createAssignment(assignment: OwnerPropertyAssignment): Promise<OwnerPropertyAssignment | null> {
    const { data, error } = await supabase
      .from('owner_property_assignments')
      .insert({
        property_id: assignment.propertyId,
        owner_id: assignment.ownerId,
        ownership_percentage: assignment.ownershipPercentage,
        resident_at_property: assignment.residentAtProperty,
        resident_from_date: assignment.residentDateRange?.from ? new Date(assignment.residentDateRange.from).toISOString() : null,
        resident_to_date: assignment.residentDateRange?.to ? new Date(assignment.residentDateRange.to).toISOString() : null,
        tax_credits: assignment.taxCredits
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return null;
    }

    return mapDbAssignmentToAssignment(data);
  },

  // List all assignments
  async listAssignments(): Promise<OwnerPropertyAssignment[]> {
    const { data, error } = await supabase
      .from('owner_property_assignments')
      .select('*');

    if (error) {
      console.error('Error listing assignments:', error);
      return [];
    }

    return data.map(mapDbAssignmentToAssignment);
  },

  // Update an assignment
  async updateAssignment(assignment: OwnerPropertyAssignment): Promise<OwnerPropertyAssignment | null> {
    // First find the assignment id based on propertyId and ownerId
    const { data: existingAssignment, error: findError } = await supabase
      .from('owner_property_assignments')
      .select('id')
      .eq('property_id', assignment.propertyId)
      .eq('owner_id', assignment.ownerId)
      .single();

    if (findError) {
      console.error('Error finding existing assignment:', findError);
      return null;
    }

    if (!existingAssignment) {
      console.error('Assignment not found');
      return null;
    }

    const { data, error } = await supabase
      .from('owner_property_assignments')
      .update({
        ownership_percentage: assignment.ownershipPercentage,
        resident_at_property: assignment.residentAtProperty,
        resident_from_date: assignment.residentDateRange?.from ? new Date(assignment.residentDateRange.from).toISOString() : null,
        resident_to_date: assignment.residentDateRange?.to ? new Date(assignment.residentDateRange.to).toISOString() : null,
        tax_credits: assignment.taxCredits
      })
      .eq('id', existingAssignment.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating assignment:', error);
      return null;
    }

    return mapDbAssignmentToAssignment(data);
  },

  // Delete an assignment
  async deleteAssignment(propertyId: string, ownerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('owner_property_assignments')
      .delete()
      .eq('property_id', propertyId)
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Error deleting assignment:', error);
      return false;
    }

    return true;
  }
};

// Helper function to map database assignment to app assignment
function mapDbAssignmentToAssignment(dbAssignment: any): OwnerPropertyAssignment {
  return {
    propertyId: dbAssignment.property_id,
    ownerId: dbAssignment.owner_id,
    ownershipPercentage: dbAssignment.ownership_percentage,
    residentAtProperty: dbAssignment.resident_at_property,
    residentDateRange: {
      from: dbAssignment.resident_from_date ? new Date(dbAssignment.resident_from_date) : null,
      to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
    },
    taxCredits: dbAssignment.tax_credits
  };
}
