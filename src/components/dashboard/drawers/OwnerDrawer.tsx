
import React, { useState } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import OwnerForm from '@/components/form/owner/OwnerForm';
import { Owner } from '@/components/dashboard/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createEmptyOwner } from '@/components/form/owner/utils';

interface OwnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  owner?: Owner;
  onSuccess: () => void;
}

const OwnerDrawer: React.FC<OwnerDrawerProps> = ({ 
  isOpen, 
  onClose, 
  owner,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResidencyDialog, setShowResidencyDialog] = useState(false);
  
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
            first_name: owner.firstName,
            last_name: owner.lastName,
            date_of_birth: owner.dateOfBirth,
            country_of_birth: owner.countryOfBirth,
            citizenship: owner.citizenship,
            address_street: owner.address.street,
            address_city: owner.address.city,
            address_zip: owner.address.zip,
            address_country: owner.address.country,
            italian_tax_code: owner.italianTaxCode,
            marital_status: owner.maritalStatus,
            is_resident_in_italy: owner.isResidentInItaly,
            italian_residence_street: owner.italianResidenceDetails?.street,
            italian_residence_city: owner.italianResidenceDetails?.city,
            italian_residence_zip: owner.italianResidenceDetails?.zip,
            updated_at: new Date()
          })
          .eq('id', owner.id);
          
        if (error) throw error;
        toast.success('Owner updated successfully');
      } else {
        // Create new owner
        const { error } = await supabase
          .from('owners')
          .insert({
            first_name: owner.firstName,
            last_name: owner.lastName,
            date_of_birth: owner.dateOfBirth,
            country_of_birth: owner.countryOfBirth,
            citizenship: owner.citizenship,
            address_street: owner.address.street,
            address_city: owner.address.city,
            address_zip: owner.address.zip,
            address_country: owner.address.country,
            italian_tax_code: owner.italianTaxCode,
            marital_status: owner.maritalStatus,
            is_resident_in_italy: owner.isResidentInItaly,
            italian_residence_street: owner.italianResidenceDetails?.street,
            italian_residence_city: owner.italianResidenceDetails?.city,
            italian_residence_zip: owner.italianResidenceDetails?.zip
          });
          
        if (error) throw error;
        toast.success('Owner added successfully');
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving owner:', error);
      toast.error('Failed to save owner');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Set up handlers for the owner form
  const [currentOwner, setCurrentOwner] = useState<Owner>(owner || createEmptyOwner());
  
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
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose} shouldScaleBackground>
      <DrawerContent className="h-[90vh] overflow-auto">
        <div className="mx-auto max-w-4xl w-full p-6">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <div>
                <DrawerTitle>{owner ? 'Edit Owner' : 'Add New Owner'}</DrawerTitle>
                <DrawerDescription>
                  {owner 
                    ? 'Update the owner details below'
                    : 'Fill in the details to add a new owner'
                  }
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="mt-4">
            <OwnerForm
              owner={currentOwner}
              editingIndex={owner ? 0 : null}
              onSubmit={handleSubmit}
              onCancel={onClose}
              onOwnerChange={handleOwnerChange}
              onCountryChange={handleCountryChange}
              onDateChange={handleDateChange}
              onInputChange={handleInputChange}
              onResidencyStatusChange={handleResidencyStatusChange}
              onResidencyDetailChange={handleResidencyDetailChange}
              showResidencyDialog={showResidencyDialog}
              setShowResidencyDialog={setShowResidencyDialog}
              hideCancel={true}
            />
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OwnerDrawer;
