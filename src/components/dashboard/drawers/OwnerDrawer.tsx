
import React, { useState } from 'react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import OwnerForm from '@/components/form/owner/OwnerForm';
import { Owner } from '@/components/dashboard/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createEmptyOwner } from '@/components/form/owner/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
            // Only access ItalianResidenceDetails properties if they exist
            italian_residence_street: owner.italianResidenceDetails?.street || null,
            italian_residence_city: owner.italianResidenceDetails?.city || null,
            italian_residence_zip: owner.italianResidenceDetails?.zip || null,
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
            // Only access ItalianResidenceDetails properties if they exist
            italian_residence_street: owner.italianResidenceDetails?.street || null,
            italian_residence_city: owner.italianResidenceDetails?.city || null,
            italian_residence_zip: owner.italianResidenceDetails?.zip || null
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[90vh] p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="relative">
              <div className="flex justify-between items-center">
                <div>
                  <SheetTitle>{owner ? 'Edit Owner' : 'Add New Owner'}</SheetTitle>
                  <SheetDescription>
                    {owner 
                      ? 'Update the owner details below'
                      : 'Fill in the details to add a new owner'
                    }
                  </SheetDescription>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
            
            <div className="mt-6">
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

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OwnerDrawer;
