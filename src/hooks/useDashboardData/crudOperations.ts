
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { transformOwnerToDb, transformPropertyToDb } from './transformers';
import { ActivityLogger } from '@/services/activityLogger';
import { AssignmentWithId } from './dataService';

export const createOwner = async (ownerData: Omit<Owner, 'id'>, userId: string) => {
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
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Enhanced owner creation activity logging
    const ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
    await ActivityLogger.logOwnerCreated(userId, newOwner.id, ownerName);

    toast.success('Owner added successfully');
    return newOwner;
  } catch (error: any) {
    console.error('Error creating owner:', error);
    toast.error('Failed to add owner');
    return null;
  }
};

export const createProperty = async (propertyData: Omit<Property, 'id'>, userId: string) => {
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
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Enhanced property creation activity logging
    await ActivityLogger.logPropertyCreated(
      userId, 
      newProperty.id, 
      propertyData.label, 
      propertyData.propertyType
    );

    toast.success('Property added successfully');
    return newProperty;
  } catch (error: any) {
    console.error('Error creating property:', error);
    toast.error('Failed to add property');
    return null;
  }
};

export const createAssignment = async (
  assignmentData: OwnerPropertyAssignment, 
  userId: string,
  owners: Owner[],
  properties: Property[]
) => {
  try {
    const assignmentId = crypto.randomUUID();

    const { data, error } = await supabase
      .from('owner_property_assignments')
      .insert({
        id: assignmentId,
        property_id: assignmentData.propertyId,
        owner_id: assignmentData.ownerId,
        ownership_percentage: assignmentData.ownershipPercentage,
        resident_at_property: assignmentData.residentAtProperty,
        resident_from_date: assignmentData.residentDateRange?.from ? assignmentData.residentDateRange.from.toISOString().split('T')[0] : null,
        resident_to_date: assignmentData.residentDateRange?.to ? assignmentData.residentDateRange.to.toISOString().split('T')[0] : null,
        tax_credits: assignmentData.taxCredits || null,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Assignment created with data:', data);

    // Get owner and property names for activity logging
    const owner = owners.find(o => o.id === assignmentData.ownerId);
    const property = properties.find(p => p.id === assignmentData.propertyId);
    
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
    const propertyLabel = property?.label || 'Unknown Property';

    await ActivityLogger.logAssignmentCreated(userId, assignmentId, ownerName, propertyLabel);

    const newAssignment: AssignmentWithId = {
      id: assignmentId,
      ...assignmentData
    };

    toast.success('Assignment created successfully');
    return newAssignment;
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    toast.error('Failed to create assignment');
    return null;
  }
};

export const updateOwner = async (id: string, updates: Partial<Owner>, userId: string, currentOwner: Owner) => {
  try {
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
    await ActivityLogger.logOwnerUpdated(userId, id, ownerName, updatedFields);

    toast.success('Owner updated successfully');
    return { id, ...updates } as Owner;
  } catch (error: any) {
    console.error('Error updating owner:', error);
    toast.error('Failed to update owner');
    return null;
  }
};

export const updateProperty = async (id: string, updates: Partial<Property>, userId: string, currentProperty: Property) => {
  try {
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
    await ActivityLogger.logPropertyUpdated(userId, id, updatedProperty.label, updatedFields);

    toast.success('Property updated successfully');
    return { id, ...updates } as Property;
  } catch (error: any) {
    console.error('Error updating property:', error);
    toast.error('Failed to update property');
    return null;
  }
};

export const updateAssignment = async (
  id: string, 
  updates: Partial<OwnerPropertyAssignment>, 
  userId: string,
  owners: Owner[],
  properties: Property[],
  currentAssignment: AssignmentWithId
) => {
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
    const owner = owners.find(o => o.id === currentAssignment.ownerId);
    const property = properties.find(p => p.id === currentAssignment.propertyId);
    
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
    const propertyLabel = property?.label || 'Unknown Property';

    await ActivityLogger.logAssignmentUpdated(userId, id, ownerName, propertyLabel);

    toast.success('Assignment updated successfully');
    return { id, ...updates } as AssignmentWithId;
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    toast.error('Failed to update assignment');
    return null;
  }
};

export const deleteOwner = async (id: string, userId: string, ownerToDelete?: Owner) => {
  try {
    // Get owner data for activity logging before deletion
    const ownerName = ownerToDelete ? `${ownerToDelete.firstName} ${ownerToDelete.lastName}` : 'Unknown Owner';

    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Enhanced owner deletion activity logging
    await ActivityLogger.logOwnerDeleted(userId, id, ownerName);

    toast.success('Owner deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting owner:', error);
    toast.error('Failed to delete owner');
    return false;
  }
};

export const deleteProperty = async (id: string, userId: string, propertyToDelete?: Property) => {
  try {
    // Get property data for activity logging before deletion
    const propertyLabel = propertyToDelete?.label || 'Unknown Property';

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Enhanced property deletion activity logging
    await ActivityLogger.logPropertyDeleted(userId, id, propertyLabel);

    toast.success('Property deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting property:', error);
    toast.error('Failed to delete property');
    return false;
  }
};

export const deleteAssignment = async (
  id: string, 
  userId: string,
  owners: Owner[],
  properties: Property[],
  assignmentToDelete?: AssignmentWithId
) => {
  try {
    // Get assignment data for activity logging before deletion
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
    await ActivityLogger.logAssignmentDeleted(userId, id, ownerName, propertyLabel);

    toast.success('Assignment deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    toast.error('Failed to delete assignment');
    return false;
  }
};
