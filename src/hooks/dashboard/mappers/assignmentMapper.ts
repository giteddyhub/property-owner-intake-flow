
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

// Function to associate orphaned data with a user ID
export const associateOrphanedData = async (
  userId: string,
  email: string,
  contactTime: Date | null = null
) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    console.log(`Attempting to associate orphaned data for user ${userId} with email ${email}`);
    
    // First, find any contacts with matching email but no user_id
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', email)
      .is('user_id', null);
      
    if (contactError) {
      console.error("Error finding orphaned contacts:", contactError);
      return { success: false, error: contactError };
    }
    
    if (contactData && contactData.length > 0) {
      console.log(`Found ${contactData.length} orphaned contacts for email ${email}`);
      
      // Update the orphaned contacts with the user ID
      for (const contact of contactData) {
        const { error: updateError } = await supabase
          .from('contacts')
          .update({ user_id: userId })
          .eq('id', contact.id);
          
        if (updateError) {
          console.error(`Error updating contact ${contact.id}:`, updateError);
        } else {
          console.log(`Successfully associated contact ${contact.id} with user ${userId}`);
          
          // Now update owners, properties and assignments associated with this contact
          await associateDataByContactId(contact.id, userId);
        }
      }
      
      return { success: true, count: contactData.length };
    } else {
      console.log(`No orphaned contacts found for email ${email}`);
      return { success: false, error: "No orphaned contacts found" };
    }
  } catch (error) {
    console.error("Error in associateOrphanedData:", error);
    return { success: false, error };
  }
};

// Helper function to associate all data related to a contact with a user ID
async function associateDataByContactId(contactId: string, userId: string) {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    // Update owners
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners')
      .update({ user_id: userId })
      .eq('contact_id', contactId)
      .is('user_id', null)
      .select('id');
      
    if (ownerError) {
      console.error(`Error updating owners for contact ${contactId}:`, ownerError);
    } else {
      console.log(`Updated ${ownerData?.length || 0} owners with user_id ${userId}`);
    }
    
    // Update properties
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .update({ user_id: userId })
      .eq('contact_id', contactId)
      .is('user_id', null)
      .select('id');
      
    if (propertyError) {
      console.error(`Error updating properties for contact ${contactId}:`, propertyError);
    } else {
      console.log(`Updated ${propertyData?.length || 0} properties with user_id ${userId}`);
    }
    
    // Update assignments
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('owner_property_assignments')
      .update({ user_id: userId })
      .eq('contact_id', contactId)
      .is('user_id', null)
      .select('id');
      
    if (assignmentError) {
      console.error(`Error updating assignments for contact ${contactId}:`, assignmentError);
    } else {
      console.log(`Updated ${assignmentData?.length || 0} assignments with user_id ${userId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in associateDataByContactId for contact ${contactId}:`, error);
    return false;
  }
}
