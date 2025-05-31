
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '@/types/form';

/**
 * Saves owners to the database and returns a mapping of temporary IDs to database IDs
 */
export const saveOwners = async (
  owners: Owner[], 
  submissionId: string,
  userId: string
): Promise<Record<string, string>> => {
  console.log("[ownerService] Saving owners:", owners.length);
  
  const ownerIdMap: Record<string, string> = {};
  
  for (const owner of owners) {
    try {
      const ownerData = {
        user_id: userId,
        form_submission_id: submissionId,
        first_name: owner.firstName,
        last_name: owner.lastName,
        date_of_birth: owner.dateOfBirth ? owner.dateOfBirth.toISOString().split('T')[0] : null,
        country_of_birth: owner.countryOfBirth,
        citizenship: owner.citizenship,
        address_street: owner.address.street,
        address_city: owner.address.city,
        address_zip: owner.address.zip,
        address_country: owner.address.country,
        address_state: owner.address.state || null, // New field for US addresses
        italian_tax_code: owner.italianTaxCode,
        marital_status: owner.maritalStatus,
        is_resident_in_italy: owner.isResidentInItaly,
        italian_residence_street: owner.italianResidenceDetails?.street || null,
        italian_residence_city: owner.italianResidenceDetails?.city || null,
        italian_residence_zip: owner.italianResidenceDetails?.zip || null,
        state_of_birth: owner.stateOfBirth || null, // For US-born individuals
        state_of_citizenship: owner.stateOfCitizenship || null // For US citizens
      };
      
      console.log("[ownerService] Inserting owner data:", ownerData);
      
      const { data, error } = await supabase
        .from('owners')
        .insert(ownerData)
        .select('id')
        .single();
      
      if (error) {
        console.error("[ownerService] Error inserting owner:", error);
        throw new Error(`Failed to save owner ${owner.firstName} ${owner.lastName}: ${error.message}`);
      }
      
      ownerIdMap[owner.id] = data.id;
      console.log("[ownerService] Owner saved with ID mapping:", owner.id, "->", data.id);
      
    } catch (error) {
      console.error("[ownerService] Error saving owner:", error);
      throw error;
    }
  }
  
  return ownerIdMap;
};
