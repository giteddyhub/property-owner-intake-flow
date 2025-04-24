import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyDocument } from '@/types/form';

export const saveProperties = async (
  properties: Property[], 
  contactId: string
): Promise<Map<string, string>> => {
  const propertyIdMap = new Map<string, string>();
  
  for (const property of properties) {
    console.log("Saving property:", property.label);
    
    // Convert OccupancyAllocation[] to string[] for database
    const occupancyStatusStrings = property.occupancyStatuses.map(
      allocation => `${allocation.status}:${allocation.months}`
    );
    
    // Convert any legacy 'neither' values to 'owned_all_year'
    const activity2024 = property.activity2024 === 'owned_all_year' ? 'owned_all_year' : property.activity2024;
    
    // Format document information for storage in the database
    const documentStrings = property.documents ? property.documents.map(doc => 
      JSON.stringify({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadDate: doc.uploadDate.toISOString(),
        url: doc.url
      })
    ) : [];
    
    console.log("Document strings prepared for Supabase:", documentStrings);
    console.log("Use document retrieval service:", property.useDocumentRetrievalService);
    
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert({
        label: property.label,
        address_comune: property.address.comune,
        address_province: property.address.province,
        address_street: property.address.street,
        address_zip: property.address.zip,
        activity_2024: activity2024,
        purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
        purchase_price: property.purchasePrice,
        sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
        sale_price: property.salePrice,
        property_type: property.propertyType,
        remodeling: property.remodeling,
        occupancy_statuses: occupancyStatusStrings,
        rental_income: property.rentalIncome,
        contact_id: contactId,
        use_document_retrieval_service: property.useDocumentRetrievalService || false,
        documents: documentStrings.length > 0 ? documentStrings : null
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
