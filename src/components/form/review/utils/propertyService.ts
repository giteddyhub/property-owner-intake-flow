
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/form';

/**
 * Saves properties to the database and returns a mapping of temporary IDs to database IDs
 */
export const saveProperties = async (
  properties: Property[], 
  submissionId: string,
  userId: string
): Promise<Record<string, string>> => {
  console.log("[propertyService] Saving properties:", properties.length);
  
  const propertyIdMap: Record<string, string> = {};
  
  for (const property of properties) {
    try {
      // Convert occupancy allocations to simple status strings for storage
      const occupancyStatuses = property.occupancyStatuses.map(allocation => allocation.status);
      
      const propertyData = {
        user_id: userId,
        form_submission_id: submissionId,
        label: property.label,
        address_comune: property.address.comune,
        address_province: property.address.province,
        address_street: property.address.street,
        address_zip: property.address.zip,
        activity_2024: property.activity2024,
        purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
        purchase_price: property.purchasePrice || null,
        sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
        sale_price: property.salePrice || null,
        property_type: property.propertyType,
        remodeling: property.remodeling,
        occupancy_statuses: occupancyStatuses,
        rental_income: property.rentalIncome || null,
        documents: property.documents?.map(doc => doc.name) || [],
        use_document_retrieval_service: property.useDocumentRetrievalService || false
      };
      
      console.log("[propertyService] Inserting property data:", propertyData);
      
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select('id')
        .single();
      
      if (error) {
        console.error("[propertyService] Error inserting property:", error);
        throw new Error(`Failed to save property ${property.label}: ${error.message}`);
      }
      
      propertyIdMap[property.id] = data.id;
      console.log("[propertyService] Property saved with ID mapping:", property.id, "->", data.id);
      
    } catch (error) {
      console.error("[propertyService] Error saving property:", error);
      throw error;
    }
  }
  
  return propertyIdMap;
};
