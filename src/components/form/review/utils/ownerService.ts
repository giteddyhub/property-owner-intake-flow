
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '@/types/form';

/**
 * Save owners and return mapping of client-side IDs to database IDs
 */
export const saveOwners = async (owners: Owner[], contactId: string, userId: string | null = null) => {
  try {
    console.log(`Saving ${owners.length} owners with contactId:`, contactId);
    
    if (owners.length === 0) {
      return {};
    }
    
    const idMap: Record<string, string> = {};
    
    // Process each owner
    for (const owner of owners) {
      // Map from the form model to the database model
      const dbOwner = {
        first_name: owner.firstName,
        last_name: owner.lastName,
        date_of_birth: owner.dateOfBirth instanceof Date ? 
          owner.dateOfBirth.toISOString().split('T')[0] : 
          owner.dateOfBirth ? new Date(owner.dateOfBirth).toISOString().split('T')[0] : null,
        country_of_birth: owner.countryOfBirth,
        citizenship: owner.citizenship,
        address_street: owner.address.street,
        address_city: owner.address.city,
        address_zip: owner.address.zip,
        address_country: owner.address.country,
        italian_tax_code: owner.italianTaxCode,
        marital_status: owner.maritalStatus,
        is_resident_in_italy: owner.isResidentInItaly,
        italian_residence_street: owner.italianResidenceDetails?.street || null,
        italian_residence_city: owner.italianResidenceDetails?.city || null,
        italian_residence_zip: owner.italianResidenceDetails?.zip || null,
        contact_id: contactId,
        user_id: userId,  // Ensure user_id is set when available
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Inserting owner:", dbOwner);
      
      // Insert into database
      const { data, error } = await supabase
        .from('owners')
        .insert(dbOwner)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving owner:', error);
        throw new Error(`Failed to save owner ${owner.firstName} ${owner.lastName}: ${error.message}`);
      }
      
      // Store mapping of client ID to database ID
      idMap[owner.id] = data.id;
      console.log(`Mapped owner ID ${owner.id} to database ID ${data.id}`);
    }
    
    return idMap;
  } catch (error) {
    console.error('Error in saveOwners:', error);
    throw error;
  }
};
