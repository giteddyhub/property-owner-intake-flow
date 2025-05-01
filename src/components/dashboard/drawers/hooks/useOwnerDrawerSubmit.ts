
import { Owner } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OwnerSubmitProps {
  owner?: Owner;
  currentOwner: Owner;
  userId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useOwnerDrawerSubmit = () => {
  const handleSubmit = async ({
    owner,
    currentOwner,
    userId,
    onSuccess,
    onClose
  }: OwnerSubmitProps) => {
    if (!userId) {
      toast.error('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    try {
      if (owner?.id) {
        // Update existing owner
        const { error } = await supabase
          .from('owners')
          .update({
            first_name: currentOwner.firstName,
            last_name: currentOwner.lastName,
            date_of_birth: currentOwner.dateOfBirth ? currentOwner.dateOfBirth.toISOString().split('T')[0] : null,
            country_of_birth: currentOwner.countryOfBirth,
            citizenship: currentOwner.citizenship,
            address_street: currentOwner.address.street,
            address_city: currentOwner.address.city,
            address_zip: currentOwner.address.zip,
            address_country: currentOwner.address.country,
            italian_tax_code: currentOwner.italianTaxCode,
            marital_status: currentOwner.maritalStatus,
            is_resident_in_italy: currentOwner.isResidentInItaly,
            // Only access ItalianResidenceDetails properties if they exist
            italian_residence_street: currentOwner.italianResidenceDetails?.street || null,
            italian_residence_city: currentOwner.italianResidenceDetails?.city || null,
            italian_residence_zip: currentOwner.italianResidenceDetails?.zip || null,
            updated_at: new Date().toISOString(),
            user_id: userId // Make sure to include the user_id in updates too
          })
          .eq('id', owner.id);
          
        if (error) throw error;
        toast.success('Owner updated successfully');
      } else {
        // Create new owner
        const { error } = await supabase
          .from('owners')
          .insert({
            first_name: currentOwner.firstName,
            last_name: currentOwner.lastName,
            date_of_birth: currentOwner.dateOfBirth ? currentOwner.dateOfBirth.toISOString().split('T')[0] : null,
            country_of_birth: currentOwner.countryOfBirth,
            citizenship: currentOwner.citizenship,
            address_street: currentOwner.address.street,
            address_city: currentOwner.address.city,
            address_zip: currentOwner.address.zip,
            address_country: currentOwner.address.country,
            italian_tax_code: currentOwner.italianTaxCode,
            marital_status: currentOwner.maritalStatus,
            is_resident_in_italy: currentOwner.isResidentInItaly,
            // Only access ItalianResidenceDetails properties if they exist
            italian_residence_street: currentOwner.italianResidenceDetails?.street || null,
            italian_residence_city: currentOwner.italianResidenceDetails?.city || null,
            italian_residence_zip: currentOwner.italianResidenceDetails?.zip || null,
            user_id: userId // Set the user_id field with the current user's ID
          });
          
        if (error) throw error;
        toast.success('Owner added successfully');
      }

      onSuccess();
      onClose();
      return true;
    } catch (error) {
      console.error('Error saving owner:', error);
      toast.error('Failed to save owner');
      return false;
    }
  };

  return { handleSubmit };
};
