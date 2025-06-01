
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { toast } from 'sonner';
import { useUser } from '@/contexts/auth/AuthContext';
import { OwnerData, PropertyData, AssignmentData } from '@/types/admin';
import { ActivityLogger } from '@/services/activityLogger';

// Helper function to transform database owner data to frontend format
const transformOwnerData = (dbOwner: any): Owner => ({
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
const transformPropertyData = (dbProperty: any): Property => ({
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
  occupancyStatuses: dbProperty.occupancy_statuses?.map((status: string) => ({ status })) || [],
  rentalIncome: dbProperty.rental_income,
  documents: dbProperty.documents?.map((name: string) => ({ name })) || [],
  useDocumentRetrievalService: dbProperty.use_document_retrieval_service
});

// Helper function to transform database assignment data to frontend format with proper DateRange
const transformAssignmentData = (dbAssignment: any): OwnerPropertyAssignment => ({
  propertyId: dbAssignment.property_id,
  ownerId: dbAssignment.owner_id,
  ownershipPercentage: dbAssignment.ownership_percentage,
  residentAtProperty: dbAssignment.resident_at_property,
  residentDateRange: {
    from: dbAssignment.resident_from_date ? new Date(dbAssignment.resident_from_date) : null,
    to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
  },
  taxCredits: dbAssignment.tax_credits
});

// Helper function to transform frontend owner data to database format
const transformOwnerToDb = (owner: Owner) => ({
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
const transformPropertyToDb = (property: Property) => ({
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
  occupancy_statuses: property.occupancyStatuses?.map(status => status.status) || [],
  rental_income: property.rentalIncome || null,
  documents: property.documents?.map(doc => doc.name) || [],
  use_document_retrieval_service: property.useDocumentRetrievalService || false
});

// Extended assignment type that includes ID for internal use
interface AssignmentWithId extends OwnerPropertyAssignment {
  id: string;
}

export const useDashboardData = () => {
  const { user } = useUser();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data for user:', user.id);
      
      // Fetch owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownersError) {
        console.error('Error fetching owners:', ownersError);
        throw ownersError;
      }

      console.log('Fetched owners:', ownersData?.length || 0);
      setOwners((ownersData || []).map(transformOwnerData));

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      console.log('Fetched properties:', propertiesData?.length || 0);
      setProperties((propertiesData || []).map(transformPropertyData));

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('Fetched assignments:', assignmentsData?.length || 0);
      const transformedAssignments = (assignmentsData || []).map(dbAssignment => ({
        id: dbAssignment.id,
        ...transformAssignmentData(dbAssignment)
      }));
      
      setAssignments(transformedAssignments);
      console.log('Dashboard data fetch completed successfully');
      
    } catch (error: any) {
      console.error('Error in fetchDashboardData:', error);
      setError(error.message);
      // Only show toast error once, not on every retry
      if (!error.message?.includes('JWT')) {
        toast.error('Failed to load dashboard data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const createOwner = async (ownerData: Omit<Owner, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add owners');
      return null;
    }

    try {
      const newOwner: Owner = {
        ...ownerData,
        id: crypto.randomUUID()
      };

      const dbOwnerData = transformOwnerToDb(newOwner);

      const { error } = await supabase
        .from('owners')
        .insert({
          ...dbOwnerData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Enhanced owner creation activity logging
      const ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
      await ActivityLogger.logOwnerCreated(user.id, newOwner.id, ownerName);

      setOwners(prev => [...prev, newOwner]);
      toast.success('Owner added successfully');
      return newOwner;
    } catch (error: any) {
      console.error('Error creating owner:', error);
      toast.error('Failed to add owner');
      return null;
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add properties');
      return null;
    }

    try {
      const newProperty: Property = {
        ...propertyData,
        id: crypto.randomUUID()
      };

      const dbPropertyData = transformPropertyToDb(newProperty);

      const { error } = await supabase
        .from('properties')
        .insert({
          ...dbPropertyData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Enhanced property creation activity logging
      await ActivityLogger.logPropertyCreated(
        user.id, 
        newProperty.id, 
        propertyData.label, 
        propertyData.propertyType
      );

      setProperties(prev => [...prev, newProperty]);
      toast.success('Property added successfully');
      return newProperty;
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error('Failed to add property');
      return null;
    }
  };

  const createAssignment = async (assignmentData: OwnerPropertyAssignment) => {
    if (!user) {
      toast.error('You must be logged in to create assignments');
      return null;
    }

    try {
      const assignmentId = crypto.randomUUID();

      const { error } = await supabase
        .from('owner_property_assignments')
        .insert({
          property_id: assignmentData.propertyId,
          owner_id: assignmentData.ownerId,
          ownership_percentage: assignmentData.ownershipPercentage,
          resident_at_property: assignmentData.residentAtProperty,
          resident_from_date: assignmentData.residentDateRange?.from ? assignmentData.residentDateRange.from.toISOString().split('T')[0] : null,
          resident_to_date: assignmentData.residentDateRange?.to ? assignmentData.residentDateRange.to.toISOString().split('T')[0] : null,
          tax_credits: assignmentData.taxCredits || null,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Get owner and property names for activity logging
      const owner = owners.find(o => o.id === assignmentData.ownerId);
      const property = properties.find(p => p.id === assignmentData.propertyId);
      
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
      const propertyLabel = property?.label || 'Unknown Property';

      await ActivityLogger.logAssignmentCreated(user.id, assignmentId, ownerName, propertyLabel);

      const newAssignment: AssignmentWithId = {
        id: assignmentId,
        ...assignmentData
      };

      setAssignments(prev => [...prev, newAssignment]);
      toast.success('Assignment created successfully');
      return newAssignment;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
      return null;
    }
  };

  const updateOwner = async (id: string, updates: Partial<Owner>) => {
    if (!user) {
      toast.error('You must be logged in to update owners');
      return null;
    }

    try {
      const currentOwner = owners.find(o => o.id === id);
      if (!currentOwner) throw new Error('Owner not found');

      const updatedOwner = { ...currentOwner, ...updates };
      const dbUpdates = transformOwnerToDb(updatedOwner);

      const { error } = await supabase
        .from('owners')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Enhanced owner update activity logging
      const ownerName = `${updatedOwner.firstName} ${updatedOwner.lastName}`;
      const updatedFields = Object.keys(updates);
      await ActivityLogger.logOwnerUpdated(user.id, id, ownerName, updatedFields);

      setOwners(prev =>
        prev.map(owner => (owner.id === id ? { ...owner, ...updates } : owner))
      );
      toast.success('Owner updated successfully');
      return { id, ...updates } as Owner;
    } catch (error: any) {
      console.error('Error updating owner:', error);
      toast.error('Failed to update owner');
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    if (!user) {
      toast.error('You must be logged in to update properties');
      return null;
    }

    try {
      const currentProperty = properties.find(p => p.id === id);
      if (!currentProperty) throw new Error('Property not found');

      const updatedProperty = { ...currentProperty, ...updates };
      const dbUpdates = transformPropertyToDb(updatedProperty);

      const { error } = await supabase
        .from('properties')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Enhanced property update activity logging
      const updatedFields = Object.keys(updates);
      await ActivityLogger.logPropertyUpdated(user.id, id, updatedProperty.label, updatedFields);

      setProperties(prev =>
        prev.map(property => (property.id === id ? { ...property, ...updates } : property))
      );
      toast.success('Property updated successfully');
      return { id, ...updates } as Property;
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
      return null;
    }
  };

  const updateAssignment = async (id: string, updates: Partial<OwnerPropertyAssignment>) => {
    if (!user) {
      toast.error('You must be logged in to update assignments');
      return null;
    }

    try {
      const dbUpdates: any = {};
      if (updates.propertyId) dbUpdates.property_id = updates.propertyId;
      if (updates.ownerId) dbUpdates.owner_id = updates.ownerId;
      if (updates.ownershipPercentage !== undefined) dbUpdates.ownership_percentage = updates.ownershipPercentage;
      if (updates.residentAtProperty !== undefined) dbUpdates.resident_at_property = updates.residentAtProperty;
      if (updates.residentDateRange?.from !== undefined) dbUpdates.resident_from_date = updates.residentDateRange?.from?.toISOString().split('T')[0] || null;
      if (updates.residentDateRange?.to !== undefined) dbUpdates.resident_to_date = updates.residentDateRange?.to?.toISOString().split('T')[0] || null;
      if (updates.taxCredits !== undefined) dbUpdates.tax_credits = updates.taxCredits;

      const { error } = await supabase
        .from('owner_property_assignments')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Get current assignment for activity logging
      const currentAssignment = assignments.find(a => a.id === id);
      if (currentAssignment) {
        const owner = owners.find(o => o.id === currentAssignment.ownerId);
        const property = properties.find(p => p.id === currentAssignment.propertyId);
        
        const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
        const propertyLabel = property?.label || 'Unknown Property';

        await ActivityLogger.logAssignmentUpdated(user.id, id, ownerName, propertyLabel);
      }

      setAssignments(prev =>
        prev.map(assignment => (assignment.id === id ? { ...assignment, ...updates } : assignment))
      );
      toast.success('Assignment updated successfully');
      return { id, ...updates } as AssignmentWithId;
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
      return null;
    }
  };

  const deleteOwner = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete owners');
      return false;
    }

    try {
      // Get owner data for activity logging before deletion
      const ownerToDelete = owners.find(o => o.id === id);
      const ownerName = ownerToDelete ? `${ownerToDelete.firstName} ${ownerToDelete.lastName}` : 'Unknown Owner';

      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Enhanced owner deletion activity logging
      await ActivityLogger.logOwnerDeleted(user.id, id, ownerName);

      setOwners(prev => prev.filter(owner => owner.id !== id));
      toast.success('Owner deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting owner:', error);
      toast.error('Failed to delete owner');
      return false;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete properties');
      return false;
    }

    try {
      // Get property data for activity logging before deletion
      const propertyToDelete = properties.find(p => p.id === id);
      const propertyLabel = propertyToDelete?.label || 'Unknown Property';

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Enhanced property deletion activity logging
      await ActivityLogger.logPropertyDeleted(user.id, id, propertyLabel);

      setProperties(prev => prev.filter(property => property.id !== id));
      toast.success('Property deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
      return false;
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete assignments');
      return false;
    }

    try {
      // Get assignment data for activity logging before deletion
      const assignmentToDelete = assignments.find(a => a.id === id);
      let ownerName = 'Unknown Owner';
      let propertyLabel = 'Unknown Property';

      if (assignmentToDelete) {
        const owner = owners.find(o => o.id === assignmentToDelete.ownerId);
        const property = properties.find(p => p.id === assignmentToDelete.propertyId);
        
        ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
        propertyLabel = property?.label || 'Unknown Property';
      }

      const { error } = await supabase
        .from('owner_property_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Enhanced assignment deletion activity logging
      await ActivityLogger.logAssignmentDeleted(user.id, id, ownerName, propertyLabel);

      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
      toast.success('Assignment deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
      return false;
    }
  };

  return {
    owners,
    properties,
    assignments,
    loading,
    error,
    createOwner,
    createProperty,
    createAssignment,
    updateOwner,
    updateProperty,
    updateAssignment,
    deleteOwner,
    deleteProperty,
    deleteAssignment,
    refetch: fetchDashboardData
  };
};
