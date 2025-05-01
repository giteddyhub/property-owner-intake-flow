
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '@/types/form';

/**
 * Save owners and return mapping of client-side IDs to database IDs
 */
export const saveOwners = async (owners: Owner[], formSubmissionId: string, userId: string | null = null) => {
  try {
    console.log(`Saving ${owners.length} owners with formSubmissionId:`, formSubmissionId);
    
    if (owners.length === 0) {
      return {};
    }
    
    if (!userId) {
      console.error('No user ID provided to saveOwners');
      throw new Error('User ID is required to save owners');
    }
    
    const idMap: Record<string, string> = {};
    
    // Process each owner
    for (const owner of owners) {
      // Ensure address exists to prevent issues
      const address = owner.address || { street: '', city: '', zip: '', country: '' };
      
      // Map from the form model to the database model
      const dbOwner = {
        first_name: owner.firstName || '',
        last_name: owner.lastName || '',
        date_of_birth: owner.dateOfBirth instanceof Date ? 
          owner.dateOfBirth.toISOString().split('T')[0] : 
          owner.dateOfBirth ? new Date(owner.dateOfBirth).toISOString().split('T')[0] : null,
        country_of_birth: owner.countryOfBirth || '',
        citizenship: owner.citizenship || '',
        address_street: address.street,
        address_city: address.city,
        address_zip: address.zip,
        address_country: address.country,
        italian_tax_code: owner.italianTaxCode || '',
        marital_status: owner.maritalStatus || 'UNMARRIED',
        is_resident_in_italy: Boolean(owner.isResidentInItaly),
        italian_residence_street: owner.italianResidenceDetails?.street || null,
        italian_residence_city: owner.italianResidenceDetails?.city || null,
        italian_residence_zip: owner.italianResidenceDetails?.zip || null,
        form_submission_id: formSubmissionId,
        user_id: userId,
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
