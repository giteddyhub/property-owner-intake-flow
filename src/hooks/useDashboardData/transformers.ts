
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

// Helper function to transform database property data to frontend format
export const transformPropertyData = (dbProperty: any): Property => ({
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
  occupancyStatuses: Array.isArray(dbProperty.occupancy_statuses) 
    ? dbProperty.occupancy_statuses.map((allocation: any) => 
        typeof allocation === 'string' 
          ? { status: allocation, months: 12 } // Default to 12 months for legacy data
          : allocation
      )
    : [],
  rentalIncome: dbProperty.rental_income,
  documents: dbProperty.documents?.map((name: string) => ({ name })) || [],
  useDocumentRetrievalService: dbProperty.use_document_retrieval_service
});

// Helper function to transform database assignment data to frontend format with proper DateRange
export const transformAssignmentData = (dbAssignment: any): OwnerPropertyAssignment => {
  try {
    console.log('Transforming assignment data:', dbAssignment);
    
    // Ensure we have the required ID
    if (!dbAssignment.id) {
      console.error('Assignment missing ID:', dbAssignment);
      throw new Error('Assignment must have an ID');
    }

    const transformed = {
      id: dbAssignment.id,
      propertyId: dbAssignment.property_id,
      ownerId: dbAssignment.owner_id,
      ownershipPercentage: dbAssignment.ownership_percentage,
      residentAtProperty: dbAssignment.resident_at_property,
      residentDateRange: {
        from: dbAssignment.resident_from_date ? new Date(dbAssignment.resident_from_date) : null,
        to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
      },
      taxCredits: dbAssignment.tax_credits
    };

    console.log('Transformed assignment:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error transforming assignment data:', error, dbAssignment);
    throw error;
  }
};

// Helper function to transform frontend owner data to database format
export const transformOwnerToDb = (owner: Owner) => ({
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
  is_resident_in_italy: owner.isResidentInItaly,
  italian_residence_street: owner.italianResidenceDetails?.street || null,
  italian_residence_city: owner.italianResidenceDetails?.city || null,
  italian_residence_zip: owner.italianResidenceDetails?.zip || null,
  state_of_birth: owner.stateOfBirth || null,
  state_of_citizenship: owner.stateOfCitizenship || null
});

// Helper function to transform frontend property data to database format
export const transformPropertyToDb = (property: Property) => ({
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
  occupancy_statuses: property.occupancyStatuses || [] as any, // Cast to any to handle JSON column type mismatch
  rental_income: property.rentalIncome || null,
  documents: property.documents?.map(doc => doc.name) || [],
  use_document_retrieval_service: property.useDocumentRetrievalService || false
});
