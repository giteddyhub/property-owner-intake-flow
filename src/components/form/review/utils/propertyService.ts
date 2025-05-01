
import { supabase } from '@/integrations/supabase/client';
import { Property, OccupancyAllocation } from '@/types/form';

export const saveProperties = async (
  properties: Property[], 
  contactId: string,
  userId: string | null = null
): Promise<Map<string, string>> => {
  const propertyIdMap = new Map<string, string>();
  
  for (const property of properties) {
    console.log("Saving property:", property.label, "User ID:", userId);
    
    // Process documents - convert PropertyDocument objects to JSON strings
    const documentStrings = property.documents 
      ? property.documents.map(doc => JSON.stringify(doc)) 
      : [];
    
    // Convert occupancy statuses to JSON string
    const occupancyStatusesJson = JSON.stringify(property.occupancyStatuses);
    
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert({
        label: property.label,
        address_comune: property.address.comune,
        address_province: property.address.province,
        address_street: property.address.street,
        address_zip: property.address.zip,
        activity_2024: property.activity2024,
        purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
        purchase_price: property.purchasePrice,
        sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
        sale_price: property.salePrice,
        property_type: property.propertyType,
        remodeling: property.remodeling,
        occupancy_statuses: [occupancyStatusesJson], // Send as a string array
        rental_income: property.rentalIncome,
        documents: documentStrings, // Send as string array
        use_document_retrieval_service: property.useDocumentRetrievalService,
        contact_id: contactId,
        user_id: userId
      })
      .select();
      
    if (propertyError) {
      console.error("Error saving property:", propertyError);
      throw new Error(`Error saving property: ${propertyError.message}`);
    }
    
    if (propertyData && propertyData.length > 0) {
      propertyIdMap.set(property.id, propertyData[0].id);
      console.log(`Mapped property ${property.id} to database ID ${propertyData[0].id}`);
    } else {
      console.error("Property was saved but no data was returned");
      throw new Error("Failed to get database ID for property");
    }
  }
  
  return propertyIdMap;
};
