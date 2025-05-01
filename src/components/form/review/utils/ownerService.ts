
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '@/types/form';

export const saveOwners = async (owners: Owner[], contactId: string, userId: string | null = null) => {
  console.log("Saving owners with userId:", userId);
  const ownerIdMap = new Map();
  
  for (const owner of owners) {
    // Map owner data to database structure
    const ownerData = {
      first_name: owner.firstName,
      last_name: owner.lastName,
      date_of_birth: owner.dateOfBirth ? owner.dateOfBirth.toISOString().split('T')[0] : null,
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
      user_id: userId // Make sure to include the user_id
    };
    
    // Save to database
    const { data, error } = await supabase
      .from('owners')
      .insert(ownerData)
      .select();
      
    if (error) {
      console.error("Error saving owner:", error);
      throw new Error(`Error saving owner: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      ownerIdMap.set(owner.id, data[0].id);
    }
  }
  
  console.log("Saved owners count:", ownerIdMap.size);
  return ownerIdMap;
};
