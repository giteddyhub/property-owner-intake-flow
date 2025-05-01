
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/form';

export const saveProperties = async (properties: Property[], contactId: string, userId: string | null = null) => {
  console.log("Saving properties with userId:", userId);
  const propertyIdMap = new Map();
  
  for (const property of properties) {
    // Convert PropertyDocument[] to string[] by JSON stringifying each document
    const documentStrings = property.documents 
      ? property.documents.map(doc => JSON.stringify(doc))
      : [];
    
    // Map occupancy statuses to string[]
    const occupancyStatusStrings = property.occupancyStatuses
      ? property.occupancyStatuses.map(status => JSON.stringify(status))
      : [];
    
    // Map property data to database structure
    const propertyData = {
      label: property.label || `${property.address.street}, ${property.address.zip}`,
      address_street: property.address.street,
      address_comune: property.address.comune,
      address_province: property.address.province,
      address_zip: property.address.zip,
      property_type: property.propertyType,
      activity_2024: property.activity2024,
      purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
      purchase_price: property.purchasePrice || null,
      sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
      sale_price: property.salePrice || null,
      remodeling: property.remodeling || false,
      rental_income: property.rentalIncome || null,
      occupancy_statuses: occupancyStatusStrings,
      documents: documentStrings,
      use_document_retrieval_service: property.useDocumentRetrievalService || false,
      contact_id: contactId,
      user_id: userId // Make sure to include the user_id
    };
    
    // Save to database
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select();
      
    if (error) {
      console.error("Error saving property:", error);
      throw new Error(`Error saving property: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      propertyIdMap.set(property.id, data[0].id);
    }
  }
  
  console.log("Saved properties count:", propertyIdMap.size);
  return propertyIdMap;
};
