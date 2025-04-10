
import { supabase } from '@/integrations/supabase/client';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { Database } from '@/integrations/supabase/types';

// Owner functions
export const saveOwner = async (owner: Owner): Promise<string> => {
  const user = supabase.auth.getUser();
  const userId = (await user).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { italianResidenceDetails, address, ...restOwner } = owner;
  
  const ownerData = {
    user_id: userId,
    first_name: restOwner.firstName,
    last_name: restOwner.lastName,
    date_of_birth: restOwner.dateOfBirth,
    country_of_birth: restOwner.countryOfBirth,
    citizenship: restOwner.citizenship,
    street: address.street,
    city: address.city,
    zip: address.zip,
    country: address.country,
    italian_tax_code: restOwner.italianTaxCode,
    marital_status: restOwner.maritalStatus,
    is_resident_in_italy: restOwner.isResidentInItaly,
    comune_name: italianResidenceDetails?.comuneName,
    residence_start_date: italianResidenceDetails?.startDate,
    full_year: italianResidenceDetails?.fullYear
  };
  
  const { data, error } = await supabase
    .from('owners')
    .insert(ownerData)
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Error saving owner: ${error.message}`);
  }
  
  return data?.id || '';
};

export const getOwners = async (): Promise<Owner[]> => {
  const { data, error } = await supabase
    .from('owners')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching owners: ${error.message}`);
  }
  
  if (!data) return [];
  
  return data.map(owner => ({
    id: owner.id,
    firstName: owner.first_name,
    lastName: owner.last_name,
    dateOfBirth: owner.date_of_birth ? new Date(owner.date_of_birth) : null,
    countryOfBirth: owner.country_of_birth,
    citizenship: owner.citizenship,
    address: {
      street: owner.street,
      city: owner.city,
      zip: owner.zip,
      country: owner.country
    },
    italianTaxCode: owner.italian_tax_code,
    maritalStatus: owner.marital_status as any,
    isResidentInItaly: owner.is_resident_in_italy,
    italianResidenceDetails: owner.is_resident_in_italy ? {
      comuneName: owner.comune_name,
      startDate: owner.residence_start_date ? new Date(owner.residence_start_date) : undefined,
      fullYear: owner.full_year
    } : undefined
  }));
};

// Property functions
export const saveProperty = async (property: Property): Promise<string> => {
  const user = supabase.auth.getUser();
  const userId = (await user).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { address, occupancyStatuses, ...restProperty } = property;
  
  const propertyData = {
    user_id: userId,
    label: restProperty.label,
    comune: address.comune,
    province: address.province,
    street: address.street,
    zip: address.zip,
    activity_2024: restProperty.activity2024,
    purchase_date: restProperty.purchaseDate,
    purchase_price: restProperty.purchasePrice,
    sale_date: restProperty.saleDate,
    sale_price: restProperty.salePrice,
    property_type: restProperty.propertyType,
    remodeling: restProperty.remodeling,
    months_occupied: restProperty.monthsOccupied,
    rental_income: restProperty.rentalIncome
  };
  
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Error saving property: ${error.message}`);
  }
  
  // Save occupancy statuses
  if (occupancyStatuses && occupancyStatuses.length > 0) {
    const statusData = occupancyStatuses.map(status => ({
      property_id: data?.id,
      occupancy_status: status
    }));
    
    const { error: statusError } = await supabase
      .from('property_occupancy_statuses')
      .insert(statusData);
    
    if (statusError) {
      throw new Error(`Error saving occupancy statuses: ${statusError.message}`);
    }
  }
  
  return data?.id || '';
};

export const getProperties = async (): Promise<Property[]> => {
  // Fetch properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching properties: ${error.message}`);
  }
  
  if (!properties) return [];
  
  // Fetch occupancy statuses for each property
  const propertiesWithStatuses = await Promise.all(
    properties.map(async (property) => {
      const { data: statuses, error: statusError } = await supabase
        .from('property_occupancy_statuses')
        .select('occupancy_status')
        .eq('property_id', property.id);
      
      if (statusError) {
        throw new Error(`Error fetching occupancy statuses: ${statusError.message}`);
      }
      
      return {
        id: property.id,
        label: property.label,
        address: {
          comune: property.comune,
          province: property.province,
          street: property.street,
          zip: property.zip
        },
        activity2024: property.activity_2024 as any,
        purchaseDate: property.purchase_date ? new Date(property.purchase_date) : null,
        purchasePrice: property.purchase_price,
        saleDate: property.sale_date ? new Date(property.sale_date) : null,
        salePrice: property.sale_price,
        propertyType: property.property_type as any,
        remodeling: property.remodeling,
        occupancyStatuses: statuses ? statuses.map(s => s.occupancy_status) as any[] : [],
        monthsOccupied: property.months_occupied,
        rentalIncome: property.rental_income
      };
    })
  );
  
  return propertiesWithStatuses;
};

// Assignment functions
export const saveAssignment = async (assignment: OwnerPropertyAssignment): Promise<string> => {
  const user = supabase.auth.getUser();
  const userId = (await user).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { residentDateRange, ...restAssignment } = assignment;
  
  const assignmentData = {
    user_id: userId,
    property_id: restAssignment.propertyId,
    owner_id: restAssignment.ownerId,
    ownership_percentage: restAssignment.ownershipPercentage,
    resident_at_property: restAssignment.residentAtProperty,
    resident_from: residentDateRange?.from,
    resident_to: residentDateRange?.to,
    tax_credits: restAssignment.taxCredits
  };
  
  const { data, error } = await supabase
    .from('owner_property_assignments')
    .insert(assignmentData)
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Error saving assignment: ${error.message}`);
  }
  
  return data?.id || '';
};

export const getAssignments = async (): Promise<OwnerPropertyAssignment[]> => {
  const { data, error } = await supabase
    .from('owner_property_assignments')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching assignments: ${error.message}`);
  }
  
  if (!data) return [];
  
  return data.map(assignment => ({
    propertyId: assignment.property_id || '',
    ownerId: assignment.owner_id || '',
    ownershipPercentage: assignment.ownership_percentage || 0,
    residentAtProperty: assignment.resident_at_property || false,
    residentDateRange: (assignment.resident_from || assignment.resident_to) ? {
      from: assignment.resident_from ? new Date(assignment.resident_from) : null,
      to: assignment.resident_to ? new Date(assignment.resident_to) : null
    } : undefined,
    taxCredits: assignment.tax_credits || 0
  }));
};

// Submit entire form
export const submitFormData = async (
  owners: Owner[], 
  properties: Property[], 
  assignments: OwnerPropertyAssignment[]
): Promise<void> => {
  try {
    // 1. Save owners and get their IDs
    const ownerPromises = owners.map(owner => saveOwner(owner));
    const ownerIds = await Promise.all(ownerPromises);
    
    // 2. Save properties and get their IDs
    const propertyPromises = properties.map(property => saveProperty(property));
    const propertyIds = await Promise.all(propertyPromises);
    
    // 3. Save assignments using the new IDs
    const assignmentPromises = assignments.map(assignment => {
      // Find the index of the owner and property in the original arrays
      const ownerIndex = owners.findIndex(o => o.id === assignment.ownerId);
      const propertyIndex = properties.findIndex(p => p.id === assignment.propertyId);
      
      // Create a new assignment with the database IDs
      return saveAssignment({
        ...assignment,
        ownerId: ownerIds[ownerIndex],
        propertyId: propertyIds[propertyIndex]
      });
    });
    
    await Promise.all(assignmentPromises);
  } catch (error: any) {
    throw new Error(`Error submitting form data: ${error.message}`);
  }
};
