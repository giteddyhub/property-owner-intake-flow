import { OwnerPropertyAssignment } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';

export const mapDbAssignmentsToAssignments = (dbAssignments: any[]): OwnerPropertyAssignment[] => {
  return dbAssignments.map(dbAssignment => ({
    id: dbAssignment.id,
    ownerId: dbAssignment.owner_id,
    propertyId: dbAssignment.property_id,
    ownershipPercentage: dbAssignment.ownership_percentage,
    residentAtProperty: dbAssignment.resident_at_property,
    residentDateRange: {
      from: dbAssignment.resident_from_date ? new Date(dbAssignment.resident_from_date) : undefined,
      to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : undefined,
    },
    taxCredits: dbAssignment.tax_credits,
    userId: dbAssignment.user_id,
  }));
};

/**
 * Associates orphaned data with a user ID
 * This function attempts to find and associate data that was submitted
 * without a proper user ID association
 */
export const associateOrphanedData = async (
  userId: string, 
  userEmail: string, 
  emailOnlyMode: boolean = false
): Promise<{success: boolean, message?: string}> => {
  console.log(`Looking for orphaned data. UserId: ${userId}, Email: ${userEmail}, EmailOnlyMode: ${emailOnlyMode}`);

  try {
    // First, check if there are orphaned contact records with this email
    let contactQuery = supabase
      .from('contacts')
      .select('id, email, full_name, user_id')
      .eq('email', userEmail);
      
    // Apply the appropriate filter based on emailOnlyMode
    if (emailOnlyMode) {
      // If in email-only mode, look for contacts with null user_id
      contactQuery = contactQuery.is('user_id', null);
    } else {
      // Otherwise, filter by the provided userId or null
      contactQuery = contactQuery.or(`user_id.eq.${userId},user_id.is.null`);
    }
    
    const { data: contactData, error: contactError } = await contactQuery;
      
    if (contactError) {
      console.error("Error checking for orphaned contacts:", contactError);
      return { success: false, message: contactError.message };
    }
    
    console.log(`Found ${contactData?.length || 0} potential orphaned contacts:`, contactData);
    
    // If no matching contacts, return early
    if (!contactData || contactData.length === 0) {
      return { success: false, message: "No matching contacts found" };
    }
    
    // Process each contact found
    for (const contact of contactData) {
      if (contact.user_id && contact.user_id !== userId) {
        console.log(`Contact ${contact.id} already has a different user_id: ${contact.user_id}`);
        continue; // Skip contacts that are already associated with a different user
      }
      
      // Update contact with the user's ID if needed
      if (!contact.user_id) {
        console.log(`Updating contact ${contact.id} to associate with user ${userId}`);
        
        const { error: updateError } = await supabase
          .from('contacts')
          .update({ user_id: userId })
          .eq('id', contact.id);
          
        if (updateError) {
          console.error(`Error updating contact ${contact.id}:`, updateError);
          continue;
        }
      }
      
      // Associate orphaned owners, properties, and assignments for this contact
      await associateOrphanedOwners(contact.id, userId);
      await associateOrphanedProperties(contact.id, userId);
      await associateOrphanedAssignments(contact.id, userId);
    }
    
    return { success: true, message: "Successfully associated orphaned data" };
  } catch (error) {
    console.error("Error in associateOrphanedData:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
};

/**
 * Associates orphaned owners with a user ID
 */
const associateOrphanedOwners = async (contactId: string, userId: string): Promise<void> => {
  // First fetch owners with this contact_id
  const { data: owners, error: fetchError } = await supabase
    .from('owners')
    .select('id')
    .eq('contact_id', contactId)
    .is('user_id', null);
    
  if (fetchError) {
    console.error(`Error fetching orphaned owners for contact ${contactId}:`, fetchError);
    return;
  }
  
  console.log(`Found ${owners?.length || 0} orphaned owners for contact ${contactId}`);
  
  // Update each owner with the user's ID
  for (const owner of owners || []) {
    const { error: updateError } = await supabase
      .from('owners')
      .update({ user_id: userId })
      .eq('id', owner.id);
      
    if (updateError) {
      console.error(`Error updating owner ${owner.id}:`, updateError);
    }
  }
};

/**
 * Associates orphaned properties with a user ID
 */
const associateOrphanedProperties = async (contactId: string, userId: string): Promise<void> => {
  // First fetch properties with this contact_id
  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('id')
    .eq('contact_id', contactId)
    .is('user_id', null);
    
  if (fetchError) {
    console.error(`Error fetching orphaned properties for contact ${contactId}:`, fetchError);
    return;
  }
  
  console.log(`Found ${properties?.length || 0} orphaned properties for contact ${contactId}`);
  
  // Update each property with the user's ID
  for (const property of properties || []) {
    const { error: updateError } = await supabase
      .from('properties')
      .update({ user_id: userId })
      .eq('id', property.id);
      
    if (updateError) {
      console.error(`Error updating property ${property.id}:`, updateError);
    }
  }
};

/**
 * Associates orphaned assignments with a user ID
 */
const associateOrphanedAssignments = async (contactId: string, userId: string): Promise<void> => {
  // First fetch assignments with this contact_id
  const { data: assignments, error: fetchError } = await supabase
    .from('owner_property_assignments')
    .select('id')
    .eq('contact_id', contactId)
    .is('user_id', null);
    
  if (fetchError) {
    console.error(`Error fetching orphaned assignments for contact ${contactId}:`, fetchError);
    return;
  }
  
  console.log(`Found ${assignments?.length || 0} orphaned assignments for contact ${contactId}`);
  
  // Update each assignment with the user's ID
  for (const assignment of assignments || []) {
    const { error: updateError } = await supabase
      .from('owner_property_assignments')
      .update({ user_id: userId })
      .eq('id', assignment.id);
      
    if (updateError) {
      console.error(`Error updating assignment ${assignment.id}:`, updateError);
    }
  }
};
