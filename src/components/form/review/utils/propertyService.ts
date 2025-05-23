
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/form';

/**
 * Save properties and return mapping of client-side IDs to database IDs
 */
export const saveProperties = async (properties: Property[], formSubmissionId: string, userId: string | null = null) => {
  try {
    console.log(`Saving ${properties.length} properties with formSubmissionId:`, formSubmissionId);
    
    if (properties.length === 0) {
      return {};
    }
    
    if (!userId) {
      console.error('No user ID provided to saveProperties');
      throw new Error('User ID is required to save properties');
    }
    
    const idMap: Record<string, string> = {};
    
    // Process each property
    for (const property of properties) {
      // Ensure address fields exist to prevent issues
      const address = property.address || { comune: '', province: '', street: '', zip: '' };
      
      // Format documents for database storage
      const documentStrings = property.documents && property.documents.length > 0
        ? property.documents.map(doc => JSON.stringify(doc))
        : [];
      
      // Format dates correctly
      const purchaseDate = property.purchaseDate instanceof Date
        ? property.purchaseDate.toISOString().split('T')[0]
        : property.purchaseDate ? new Date(property.purchaseDate).toISOString().split('T')[0] : null;
      
      const saleDate = property.saleDate instanceof Date
        ? property.saleDate.toISOString().split('T')[0]
        : property.saleDate ? new Date(property.saleDate).toISOString().split('T')[0] : null;
      
      // Format occupancy statuses
      const occupancyStatusesJson = JSON.stringify(property.occupancyStatuses || []);
      
      // Map from form model to database model
      const dbProperty = {
        label: property.label || 'Untitled Property',
        address_comune: address.comune,
        address_province: address.province,
        address_street: address.street,
        address_zip: address.zip,
        activity_2024: property.activity2024 || 'owned_all_year',
        purchase_date: purchaseDate,
        purchase_price: property.purchasePrice ? Number(property.purchasePrice) : null,
        sale_date: saleDate,
        sale_price: property.salePrice ? Number(property.salePrice) : null,
        property_type: property.propertyType || 'RESIDENTIAL',
        remodeling: Boolean(property.remodeling),
        occupancy_statuses: [occupancyStatusesJson], // Store as an array of JSON strings
        rental_income: property.rentalIncome ? Number(property.rentalIncome) : null,
        documents: documentStrings,
        use_document_retrieval_service: Boolean(property.useDocumentRetrievalService),
        form_submission_id: formSubmissionId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Inserting property:", {
        ...dbProperty,
        documents: dbProperty.documents ? `${dbProperty.documents.length} documents` : 'no documents',
        occupancy_statuses: 'JSON string array (abbreviated)'
      });
      
      // Insert into database
      const { data, error } = await supabase
        .from('properties')
        .insert(dbProperty)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving property:', error);
        throw new Error(`Failed to save property ${property.label}: ${error.message}`);
      }
      
      // Store mapping of client ID to database ID
      idMap[property.id] = data.id;
      console.log(`Mapped property ID ${property.id} to database ID ${data.id}`);
    }
    
    return idMap;
  } catch (error) {
    console.error('Error in saveProperties:', error);
    throw error;
  }
};
