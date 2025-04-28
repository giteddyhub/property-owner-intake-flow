
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import PropertyForm from '@/components/form/property/PropertyForm';
import { Property } from '@/components/dashboard/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  onSuccess: () => void;
}

const PropertyDrawer: React.FC<PropertyDrawerProps> = ({ 
  isOpen, 
  onClose, 
  property,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure clean up on unmount or when drawer closes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);
  
  const handleSubmit = async (newProperty: Property, occupancyMonths: Record<string, number>) => {
    setIsSubmitting(true);
    
    try {
      // Convert occupancy statuses to JSON string
      const occupancyStatusesJson = JSON.stringify(newProperty.occupancyStatuses);
      
      // Process documents - convert PropertyDocument objects to array of strings
      const documentStrings = newProperty.documents && newProperty.documents.length > 0
        ? newProperty.documents.map(doc => JSON.stringify(doc))
        : [];
      
      // Prepare property data for the database
      const propertyData = {
        label: newProperty.label,
        address_comune: newProperty.address.comune,
        address_province: newProperty.address.province,
        address_street: newProperty.address.street,
        address_zip: newProperty.address.zip,
        activity_2024: newProperty.activity2024,
        purchase_date: newProperty.purchaseDate ? newProperty.purchaseDate.toISOString().split('T')[0] : null,
        purchase_price: newProperty.purchasePrice,
        sale_date: newProperty.saleDate ? newProperty.saleDate.toISOString().split('T')[0] : null,
        sale_price: newProperty.salePrice,
        property_type: newProperty.propertyType,
        remodeling: newProperty.remodeling,
        occupancy_statuses: [occupancyStatusesJson], // Send as a string array
        rental_income: newProperty.rentalIncome,
        documents: documentStrings, // Send as string array
        use_document_retrieval_service: newProperty.useDocumentRetrievalService,
        updated_at: new Date().toISOString()
      };
      
      if (property?.id) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
          
        if (error) throw error;
        toast.success('Property updated successfully');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert(propertyData);
          
        if (error) throw error;
        toast.success('Property added successfully');
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle clean close to ensure no stray elements block interaction
  const handleClose = () => {
    // Remove any pointer-events blocking that might have been applied
    document.body.style.pointerEvents = '';
    onClose();
  };
  
  return (
    <Drawer open={isOpen} onOpenChange={handleClose} shouldScaleBackground>
      <DrawerContent className="h-[90vh] max-h-[90vh] p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <DrawerHeader className="sticky top-0 z-10 bg-background">
              <div className="flex justify-between items-center">
                <div>
                  <DrawerTitle>{property ? 'Edit Property' : 'Add New Property'}</DrawerTitle>
                  <DrawerDescription>
                    {property 
                      ? 'Update the property details below'
                      : 'Fill in the details to add a new property'
                    }
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" onClick={() => {
                    // Ensure pointer-events are enabled when closing via button
                    document.body.style.pointerEvents = '';
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            
            <div className="pt-2">
              <PropertyForm
                property={property || {
                  id: '',
                  label: '',
                  address: {
                    comune: '',
                    province: '',
                    street: '',
                    zip: ''
                  },
                  activity2024: 'owned_all_year',
                  propertyType: 'RESIDENTIAL',
                  remodeling: false,
                  occupancyStatuses: [{ status: 'PERSONAL_USE', months: 12 }]
                }}
                editingIndex={property ? 0 : null}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                hideCancel={true}
                standalone={true}
              />
            </div>

            {/* Non-sticky footer at the bottom */}
            <div className="mt-4 border-t">
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" onClick={() => {
                    // Ensure pointer-events are enabled when closing via button
                    document.body.style.pointerEvents = '';
                  }}>Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default PropertyDrawer;
