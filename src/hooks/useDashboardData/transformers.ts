
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

// Helper function to transform database owner data to frontend format
export const transformOwnerData = (dbOwner: any): Owner => ({
  id: dbOwner.id,
  firstName: dbOwner.first_name,
  lastName: dbOwner.last_name,
  dateOfBirth: dbOwner.date_of_birth ? new Date(dbOwner.date_of_birth) : null,
  countryOfBirth: dbOwner.country_of_birth,
  citizenship: dbOwner.citizenship,
  address: {
    street: dbOwner.address_street,
    city: dbOwner.address_city,
    zip: dbOwner.address_zip,
    country: dbOwner.address_country,
    state: dbOwner.address_state
  },
  italianTaxCode: dbOwner.italian_tax_code,
  maritalStatus: dbOwner.marital_status,
  isResidentInItaly: dbOwner.is_resident_in_italy,
  italianResidenceDetails: dbOwner.italian_residence_street ? {
    street: dbOwner.italian_residence_street,
    city: dbOwner.italian_residence_city,
    zip: dbOwner.italian_residence_zip
  } : undefined,
  stateOfBirth: dbOwner.state_of_birth,
  stateOfCitizenship: dbOwner.state_of_citizenship
});

// Enhanced helper function to safely parse occupancy statuses from database with validation
const parseOccupancyStatuses = (dbOccupancyStatuses: any): any[] => {
  console.log('[parseOccupancyStatuses] Input data:', dbOccupancyStatuses, 'Type:', typeof dbOccupancyStatuses);
  
  if (!dbOccupancyStatuses) {
    console.log('[parseOccupancyStatuses] No data provided, returning empty array');
    return [];
  }

  try {
    let parsed: any[];

    // Handle if it's already an array
    if (Array.isArray(dbOccupancyStatuses)) {
      console.log('[parseOccupancyStatuses] Input is array, processing...');
      // Check for double-nested arrays: [[{...}]] → [{...}]
      parsed = dbOccupancyStatuses.flat();
    } else if (typeof dbOccupancyStatuses === 'string') {
      console.log('[parseOccupancyStatuses] Input is string, attempting to parse JSON...');
      try {
        const jsonParsed = JSON.parse(dbOccupancyStatuses);
        parsed = Array.isArray(jsonParsed) ? jsonParsed.flat() : [jsonParsed];
      } catch (jsonError) {
        console.warn('[parseOccupancyStatuses] Failed to parse as JSON, treating as legacy string format');
        // Legacy format: single status string
        return [{ status: dbOccupancyStatuses, months: 12 }];
      }
    } else {
      console.warn('[parseOccupancyStatuses] Unexpected data type, returning empty array');
      return [];
    }

    // Transform each allocation to ensure consistent format
    const result = parsed.map((allocation: any, index: number) => {
      console.log(`[parseOccupancyStatuses] Processing allocation ${index}:`, allocation);
      
      if (typeof allocation === 'string') {
        try {
          // Try to parse as JSON first (new format)
          const parsed = JSON.parse(allocation);
          if (parsed && typeof parsed === 'object' && 'status' in parsed) {
            console.log(`[parseOccupancyStatuses] Parsed JSON allocation ${index}:`, parsed);
            return {
              status: parsed.status,
              months: parsed.months || 0
            };
          }
        } catch {
          // If parsing fails, treat as legacy format: just status strings
          console.log(`[parseOccupancyStatuses] Legacy string allocation ${index}:`, allocation);
          return { status: allocation, months: 12 };
        }
      } else if (typeof allocation === 'object' && allocation !== null) {
        // Modern format: objects with status and months
        const validated = {
          status: allocation.status || 'PERSONAL_USE',
          months: typeof allocation.months === 'number' ? allocation.months : 0
        };
        console.log(`[parseOccupancyStatuses] Object allocation ${index}:`, validated);
        return validated;
      }
      
      console.warn(`[parseOccupancyStatuses] Invalid allocation ${index}, using default:`, allocation);
      return { status: 'PERSONAL_USE', months: 0 };
    });

    console.log('[parseOccupancyStatuses] Final result:', result);
    return result;
  } catch (error) {
    console.error('[parseOccupancyStatuses] Error parsing occupancy statuses:', error);
    return [];
  }
};

// Helper function to transform database property data to frontend format
export const transformPropertyData = (dbProperty: any): Property => {
  console.log('[transformPropertyData] Raw database property:', dbProperty);
  
  const occupancyStatuses = parseOccupancyStatuses(dbProperty.occupancy_statuses);
  console.log('[transformPropertyData] Parsed occupancy statuses:', occupancyStatuses);
  
  const transformed = {
    id: dbProperty.id,
    label: dbProperty.label,
    address: {
      comune: dbProperty.address_comune,
      province: dbProperty.address_province,
      street: dbProperty.address_street,
      zip: dbProperty.address_zip
    },
    activity2024: dbProperty.activity_2024,
    purchaseDate: dbProperty.purchase_date ? new Date(dbProperty.purchase_date) : undefined,
    purchasePrice: dbProperty.purchase_price,
    saleDate: dbProperty.sale_date ? new Date(dbProperty.sale_date) : undefined,
    salePrice: dbProperty.sale_price,
    propertyType: dbProperty.property_type,
    remodeling: dbProperty.remodeling,
    occupancyStatuses: occupancyStatuses,
    rentalIncome: dbProperty.rental_income,
    documents: dbProperty.documents?.map((name: string) => ({ name })) || [],
    useDocumentRetrievalService: dbProperty.use_document_retrieval_service
  };

  console.log('[transformPropertyData] Final transformed property:', transformed);
  return transformed;
};

// Helper function to transform database assignment data to frontend format with proper DateRange
export const transformAssignmentData = (dbAssignment: any): OwnerPropertyAssignment => {
  try {
    console.log('[transformAssignmentData] Transforming assignment data:', dbAssignment);
    
    // Ensure we have the required ID
    if (!dbAssignment.id) {
      console.error('[transformAssignmentData] Assignment missing ID:', dbAssignment);
      throw new Error('Assignment must have an ID');
    }

    const transformed = {
      id: dbAssignment.id,
      propertyId: dbAssignment.property_id,
      ownerId: dbAssignment.owner_id,
      ownershipPercentage: dbAssignment.ownership_percentage,
      residentAtProperty: Boolean(dbAssignment.resident_at_property),
      residentDateRange: {
        from: dbAssignment.resident_from_date ? new Date(dbAssignment.resident_from_date) : null,
        to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
      },
      taxCredits: dbAssignment.tax_credits || 0
    };

    console.log('[transformAssignmentData] Transformed assignment:', transformed);
    return transformed;
  } catch (error) {
    console.error('[transformAssignmentData] Error transforming assignment data:', error, dbAssignment);
    throw error;
  }
};

// Helper function to transform frontend owner data to database format
export const transformOwnerToDb = (owner: Owner) => {
  console.log('[transformOwnerToDb] Transforming owner to database format:', owner);
  
  const dbData = {
    first_name: owner.firstName,
    last_name: owner.lastName,
    date_of_birth: owner.dateOfBirth ? owner.dateOfBirth.toISOString().split('T')[0] : null,
    country_of_birth: owner.countryOfBirth,
    citizenship: owner.citizenship,
    address_street: owner.address.street,
    address_city: owner.address.city,
    address_zip: owner.address.zip,
    address_country: owner.address.country,
    address_state: owner.address.state || null,
    italian_tax_code: owner.italianTaxCode,
    marital_status: owner.maritalStatus,
    is_resident_in_italy: Boolean(owner.isResidentInItaly), // Ensure boolean consistency
    italian_residence_street: owner.italianResidenceDetails?.street || null,
    italian_residence_city: owner.italianResidenceDetails?.city || null,
    italian_residence_zip: owner.italianResidenceDetails?.zip || null,
    state_of_birth: owner.stateOfBirth || null,
    state_of_citizenship: owner.stateOfCitizenship || null
  };

  console.log('[transformOwnerToDb] Database format:', dbData);
  return dbData;
};

// Enhanced helper function to transform frontend property data to database format
export const transformPropertyToDb = (property: Property) => {
  console.log('[transformPropertyToDb] Input property:', property);
  
  // Convert occupancy statuses to consistent JSON strings for database storage
  const occupancyStatuses = property.occupancyStatuses?.map((allocation: any) => {
    const normalized = {
      status: allocation?.status || 'PERSONAL_USE',
      months: typeof allocation?.months === 'number' ? allocation.months : 0
    };
    const jsonString = JSON.stringify(normalized);
    console.log('[transformPropertyToDb] Normalized allocation:', normalized, '-> JSON:', jsonString);
    return jsonString;
  }) || [];
  
  console.log('[transformPropertyToDb] All occupancy statuses as JSON strings:', occupancyStatuses);
  
  const dbData = {
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
    remodeling: Boolean(property.remodeling),
    occupancy_statuses: occupancyStatuses,
    rental_income: property.rentalIncome || null,
    documents: property.documents?.map(doc => doc.name) || [],
    use_document_retrieval_service: Boolean(property.useDocumentRetrievalService || false)
  };

  console.log('[transformPropertyToDb] Final database format:', dbData);
  return dbData;
};
