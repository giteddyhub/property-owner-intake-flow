
import { useState, useEffect } from 'react';
import { Owner } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createEmptyOwner } from '@/components/form/owner/utils';

interface UseOwnerDrawerProps {
  owner?: Owner;
  onClose: () => void;
  onSuccess: () => void;
}

export const useOwnerDrawer = ({ owner, onClose, onSuccess }: UseOwnerDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResidencyDialog, setShowResidencyDialog] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner>(owner || createEmptyOwner());
  
  // Reset currentOwner when owner prop changes
  useEffect(() => {
    setCurrentOwner(owner || createEmptyOwner());
  }, [owner]);
  
  // Ensure clean up on unmount or when drawer closes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      document.body.style.pointerEvents = '';
    };
  }, []);
  
  const handleSubmit = async () => {
    if (showResidencyDialog) {
      return; // Don't proceed if residency dialog needs to be shown
    }
    
    setIsSubmitting(true);
    
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
            updated_at: new Date().toISOString()
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
            italian_residence_zip: currentOwner.italianResidenceDetails?.zip || null
          });
          
        if (error) throw error;
        toast.success('Owner added successfully');
      }

      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving owner:', error);
      toast.error('Failed to save owner');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Field handlers
  const handleOwnerChange = (field: string, value: any) => {
    setCurrentOwner(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleOwnerChange(name, value);
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setCurrentOwner(prev => ({
      ...prev,
      dateOfBirth: date || null
    }));
  };
  
  const handleCountryChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleResidencyStatusChange = (value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      isResidentInItaly: value === 'true'
    }));
  };
  
  const handleResidencyDetailChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...prev.italianResidenceDetails,
        [field]: value
      }
    }));
  };

  // Handle clean close to ensure no stray elements block interaction
  const handleClose = () => {
    // Remove any pointer-events blocking that might have been applied
    document.body.style.pointerEvents = '';
    onClose();
  };

  return {
    isSubmitting,
    currentOwner,
    showResidencyDialog,
    setShowResidencyDialog,
    handleSubmit,
    handleOwnerChange,
    handleInputChange,
    handleDateChange,
    handleCountryChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleClose
  };
};
