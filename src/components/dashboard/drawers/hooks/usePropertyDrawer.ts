
import { useState, useEffect } from 'react';
import { Property } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePropertyDrawerProps {
  property?: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const usePropertyDrawer = ({ 
  property, 
  onClose, 
  onSuccess 
}: UsePropertyDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure clean up on unmount or when drawer closes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      document.body.style.pointerEvents = '';
    };
  }, []);

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
      
      console.log("Saving property with document retrieval:", newProperty.useDocumentRetrievalService);
      
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

      handleClose();
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

  return {
    isSubmitting,
    handleSubmit,
    handleClose
  };
};
