
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
      console.log("Attempting to save property:", newProperty);
      
      // Convert occupancy statuses to JSON string
      const occupancyStatusesJson = JSON.stringify(newProperty.occupancyStatuses);
      console.log("Occupancy statuses JSON:", occupancyStatusesJson);
      
      // Process documents - convert PropertyDocument objects to array of strings
      const documentStrings = newProperty.documents && newProperty.documents.length > 0
        ? newProperty.documents.map(doc => JSON.stringify(doc))
        : [];
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found. Please login again.");
      }
      
      // Format dates correctly - ensure they are in YYYY-MM-DD format
      const purchaseDate = newProperty.purchaseDate 
        ? newProperty.purchaseDate instanceof Date 
          ? newProperty.purchaseDate.toISOString().split('T')[0] 
          : new Date(newProperty.purchaseDate).toISOString().split('T')[0]
        : null;
        
      const saleDate = newProperty.saleDate 
        ? newProperty.saleDate instanceof Date
          ? newProperty.saleDate.toISOString().split('T')[0]
          : new Date(newProperty.saleDate).toISOString().split('T')[0]
        : null;
      
      // Prepare property data for the database
      const propertyData = {
        label: newProperty.label,
        address_comune: newProperty.address.comune,
        address_province: newProperty.address.province,
        address_street: newProperty.address.street,
        address_zip: newProperty.address.zip,
        activity_2024: newProperty.activity2024,
        purchase_date: purchaseDate,
        purchase_price: newProperty.purchasePrice ? Number(newProperty.purchasePrice) : null,
        sale_date: saleDate,
        sale_price: newProperty.salePrice ? Number(newProperty.salePrice) : null,
        property_type: newProperty.propertyType,
        remodeling: newProperty.remodeling,
        occupancy_statuses: [occupancyStatusesJson], // Send as a string array
        rental_income: newProperty.rentalIncome ? Number(newProperty.rentalIncome) : null,
        documents: documentStrings, // Send as string array
        use_document_retrieval_service: Boolean(newProperty.useDocumentRetrievalService),
        updated_at: new Date().toISOString(),
        user_id: user.id  // Always set the user_id
      };
      
      console.log("Saving property data:", propertyData);
      console.log("Document retrieval:", newProperty.useDocumentRetrievalService);
      
      if (property?.id) {
        // Update existing property
        console.log("Updating existing property with ID:", property.id);
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
          
        if (error) {
          console.error('Error updating property:', error);
          throw error;
        }
        toast.success('Property updated successfully');
      } else {
        // Create new property - add user_id and created_at
        console.log("Creating new property for user:", user.id);
        const { data, error } = await supabase
          .from('properties')
          .insert({
            ...propertyData,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) {
          console.error('Error creating property:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Property created successfully with ID:", data[0].id);
        }
        
        toast.success('Property added successfully');
      }

      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle clean close to ensure no stray elements block interaction
  const handleClose = () => {
    // Remove any pointer-events blocking that might have been applied
    document.body.style.pointerEvents = '';
    // Remove any lingering overlay elements
    const overlays = document.querySelectorAll('[data-state="open"][data-radix-portal]');
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    onClose();
  };

  return {
    isSubmitting,
    handleSubmit,
    handleClose
  };
};
