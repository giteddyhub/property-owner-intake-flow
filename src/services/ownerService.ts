
import { supabase } from "@/integrations/supabase/client";
import { Owner } from "@/types/form";

export const ownerService = {
  // Create a new owner
  async createOwner(owner: Omit<Owner, 'id'>): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .insert({
        first_name: owner.firstName,
        last_name: owner.lastName,
        date_of_birth: owner.dateOfBirth ? new Date(owner.dateOfBirth).toISOString() : null,
        country_of_birth: owner.countryOfBirth,
        citizenship: owner.citizenship,
        address_street: owner.address.street,
        address_city: owner.address.city,
        address_zip: owner.address.zip,
        address_country: owner.address.country,
        italian_tax_code: owner.italianTaxCode,
        marital_status: owner.maritalStatus,
        is_resident_in_italy: owner.isResidentInItaly,
        italian_residence_comune_name: owner.italianResidenceDetails?.comuneName,
        italian_residence_street: owner.italianResidenceDetails?.street,
        italian_residence_city: owner.italianResidenceDetails?.city,
        italian_residence_zip: owner.italianResidenceDetails?.zip,
        spent_over_182_days: owner.italianResidenceDetails?.spentOver182Days
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating owner:', error);
      return null;
    }

    return mapDbOwnerToOwner(data);
  },

  // List all owners
  async listOwners(): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*');

    if (error) {
      console.error('Error listing owners:', error);
      return [];
    }

    return data.map(mapDbOwnerToOwner);
  },

  // Update an owner
  async updateOwner(owner: Owner): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .update({
        first_name: owner.firstName,
        last_name: owner.lastName,
        date_of_birth: owner.dateOfBirth ? new Date(owner.dateOfBirth).toISOString() : null,
        country_of_birth: owner.countryOfBirth,
        citizenship: owner.citizenship,
        address_street: owner.address.street,
        address_city: owner.address.city,
        address_zip: owner.address.zip,
        address_country: owner.address.country,
        italian_tax_code: owner.italianTaxCode,
        marital_status: owner.maritalStatus,
        is_resident_in_italy: owner.isResidentInItaly,
        italian_residence_comune_name: owner.italianResidenceDetails?.comuneName,
        italian_residence_street: owner.italianResidenceDetails?.street,
        italian_residence_city: owner.italianResidenceDetails?.city,
        italian_residence_zip: owner.italianResidenceDetails?.zip,
        spent_over_182_days: owner.italianResidenceDetails?.spentOver182Days
      })
      .eq('id', owner.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating owner:', error);
      return null;
    }

    return mapDbOwnerToOwner(data);
  },

  // Delete an owner
  async deleteOwner(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting owner:', error);
      return false;
    }

    return true;
  }
};

// Helper function to map database owner to app owner
function mapDbOwnerToOwner(dbOwner: any): Owner {
  return {
    id: dbOwner.id,
    firstName: dbOwner.first_name,
    lastName: dbOwner.last_name,
    dateOfBirth: dbOwner.date_of_birth ? new Date(dbOwner.date_of_birth) : null,
    countryOfBirth: dbOwner.country_of_birth,
    citizenship: dbOwner.citizenship,
    address: {
      street: dbOwner.address_street,
      city: dbOwner.address_city,
      zip: dbOwner.address_zip,
      country: dbOwner.address_country
    },
    italianTaxCode: dbOwner.italian_tax_code,
    maritalStatus: dbOwner.marital_status,
    isResidentInItaly: dbOwner.is_resident_in_italy,
    italianResidenceDetails: dbOwner.is_resident_in_italy ? {
      comuneName: dbOwner.italian_residence_comune_name,
      street: dbOwner.italian_residence_street,
      city: dbOwner.italian_residence_city,
      zip: dbOwner.italian_residence_zip,
      spentOver182Days: dbOwner.spent_over_182_days
    } : undefined
  };
}
