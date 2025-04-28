
import React, { useState, useEffect } from 'react';
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
import PropertyForm from '@/components/form/property/PropertyForm';
import { Property } from '@/components/dashboard/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose} shouldScaleBackground>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl overflow-auto h-full pb-24">
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
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="p-6 pt-2">
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
              onCancel={onClose}
              hideCancel={true}
              standalone={true}
            />
          </div>

          <DrawerFooter className="sticky bottom-0 z-10 bg-background mt-auto">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PropertyDrawer;
