
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '@/types/form';

export const saveOwners = async (
  owners: Owner[], 
  contactId: string
): Promise<Map<string, string>> => {
  const ownerIdMap = new Map<string, string>();
  
  for (const owner of owners) {
    console.log("Saving owner:", owner.firstName, owner.lastName);
    
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners')
      .insert({
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
        spent_over_182_days: owner.italianResidenceDetails?.spentOver182Days,
        italian_residence_comune_name: owner.italianResidenceDetails?.comuneName,
        italian_residence_street: owner.italianResidenceDetails?.street,
        italian_residence_city: owner.italianResidenceDetails?.city,
        italian_residence_zip: owner.italianResidenceDetails?.zip,
        contact_id: contactId
      })
      .select();
      
    if (ownerError) {
      console.error("Error saving owner:", ownerError);
      throw new Error(`Error saving owner: ${ownerError.message}`);
    }
    
    if (ownerData && ownerData.length > 0) {
      ownerIdMap.set(owner.id, ownerData[0].id);
      console.log(`Mapped owner ${owner.id} to database ID ${ownerData[0].id}`);
    } else {
      console.error("Owner was saved but no data was returned");
      throw new Error("Failed to get database ID for owner");
    }
  }
  
  return ownerIdMap;
};
