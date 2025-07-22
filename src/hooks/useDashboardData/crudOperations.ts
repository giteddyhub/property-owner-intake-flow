import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { transformOwnerToDb, transformPropertyToDb } from './transformers';
import { ActivityLogger } from '@/services/activityLogger';
import { AssignmentWithId } from './dataService';
import { handleDashboardError, logOperation, DashboardError } from './errorHandler';

export const createOwner = async (ownerData: Omit<Owner, 'id'>, userId: string) => {
  logOperation('CREATE', 'owner', undefined, { userId, firstName: ownerData.firstName, lastName: ownerData.lastName });
  
  try {
    // Validate required data
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'createOwner');
    }
    
    if (!ownerData.firstName || !ownerData.lastName) {
      throw new DashboardError('First name and last name are required', 'MISSING_REQUIRED_FIELDS', { ownerData }, 'createOwner');
    }

    const newOwner: Owner = {
      ...ownerData,
      id: crypto.randomUUID()
    };

    const dbOwnerData = transformOwnerToDb(newOwner);
    
    console.log('[createOwner] Attempting to insert:', { 
      ...dbOwnerData, 
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Validate boolean fields before insertion
    const insertData = {
      ...dbOwnerData,
      user_id: userId,
      is_resident_in_italy: Boolean(dbOwnerData.is_resident_in_italy),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[createOwner] Final insert data with validated booleans:', insertData);

    const { error } = await supabase
      .from('owners')
      .insert(insertData);

    if (error) {
      console.error('[createOwner] Supabase error:', error);
      handleDashboardError(error, 'CREATE', 'owner');
      return null;
    }

    // Enhanced owner creation activity logging
    const ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
    await ActivityLogger.logOwnerCreated(userId, newOwner.id, ownerName);

    toast.success('Owner added successfully');
    logOperation('CREATE_SUCCESS', 'owner', newOwner.id, { ownerName });
    return newOwner;
  } catch (error: any) {
    console.error('[createOwner] Error:', error);
    
    if (error instanceof DashboardError) {
      handleDashboardError(error, 'CREATE', 'owner');
    } else {
      handleDashboardError(error, 'CREATE', 'owner');
    }
    return null;
  }
};

export const createProperty = async (propertyData: Omit<Property, 'id'>, userId: string) => {
  logOperation('CREATE', 'property', undefined, { userId, label: propertyData.label });
  
  try {
    // Validate required data
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'createProperty');
    }
    
    if (!propertyData.label) {
      throw new DashboardError('Property label is required', 'MISSING_REQUIRED_FIELDS', { propertyData }, 'createProperty');
    }

    const newProperty: Property = {
      ...propertyData,
      id: crypto.randomUUID()
    };

    const dbPropertyData = transformPropertyToDb(newProperty);
    
    console.log('[createProperty] Attempting to insert:', { 
      ...dbPropertyData, 
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const { error } = await supabase
      .from('properties')
      .insert({
        ...dbPropertyData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[createProperty] Supabase error:', error);
      handleDashboardError(error, 'CREATE', 'property');
      return null;
    }

    // Enhanced property creation activity logging
    await ActivityLogger.logPropertyCreated(
      userId, 
      newProperty.id, 
      propertyData.label, 
      propertyData.propertyType
    );

    toast.success('Property added successfully');
    logOperation('CREATE_SUCCESS', 'property', newProperty.id, { label: propertyData.label });
    return newProperty;
  } catch (error: any) {
    console.error('[createProperty] Error:', error);
    
    if (error instanceof DashboardError) {
      handleDashboardError(error, 'CREATE', 'property');
    } else {
      handleDashboardError(error, 'CREATE', 'property');
    }
    return null;
  }
};

export const createAssignment = async (
  assignmentData: OwnerPropertyAssignment, 
  userId: string,
  owners: Owner[],
  properties: Property[]
) => {
  logOperation('CREATE', 'assignment', undefined, { 
    userId, 
    ownerId: assignmentData.ownerId, 
    propertyId: assignmentData.propertyId 
  });
  
  try {
    // Validate required data
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'createAssignment');
    }
    
    if (!assignmentData.ownerId || !assignmentData.propertyId) {
      throw new DashboardError('Owner and property are required', 'MISSING_REQUIRED_FIELDS', { assignmentData }, 'createAssignment');
    }

    const assignmentId = crypto.randomUUID();
    
    // Properly handle date conversion with validation
    const residentFromDate = assignmentData.residentDateRange?.from ? 
      (assignmentData.residentDateRange.from instanceof Date ? 
        assignmentData.residentDateRange.from.toISOString().split('T')[0] : 
        new Date(assignmentData.residentDateRange.from).toISOString().split('T')[0]
      ) : null;
      
    const residentToDate = assignmentData.residentDateRange?.to ? 
      (assignmentData.residentDateRange.to instanceof Date ? 
        assignmentData.residentDateRange.to.toISOString().split('T')[0] : 
        new Date(assignmentData.residentDateRange.to).toISOString().split('T')[0]
      ) : null;
    
    const insertData = {
      id: assignmentId,
      property_id: assignmentData.propertyId,
      owner_id: assignmentData.ownerId,
      ownership_percentage: assignmentData.ownershipPercentage,
      resident_at_property: Boolean(assignmentData.residentAtProperty),
      resident_from_date: residentFromDate,
      resident_to_date: residentToDate,
      tax_credits: assignmentData.taxCredits || null,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('[createAssignment] Attempting to insert with validated data:', insertData);

    const { data, error } = await supabase
      .from('owner_property_assignments')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[createAssignment] Supabase error:', error);
      handleDashboardError(error, 'CREATE', 'assignment');
      return null;
    }

    console.log('[createAssignment] Assignment created with data:', data);

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
    logOperation('CREATE_SUCCESS', 'assignment', assignmentId, { ownerName, propertyLabel });
    return newAssignment;
  } catch (error: any) {
    console.error('[createAssignment] Error:', error);
    
    if (error instanceof DashboardError) {
      handleDashboardError(error, 'CREATE', 'assignment');
    } else {
      handleDashboardError(error, 'CREATE', 'assignment');
    }
    return null;
  }
};

export const updateOwner = async (id: string, updates: Partial<Owner>, userId: string, currentOwner: Owner) => {
  logOperation('UPDATE', 'owner', id, { userId, updates });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'updateOwner');
    }

    const updatedOwner = { ...currentOwner, ...updates };
    const dbUpdates = transformOwnerToDb(updatedOwner);

    // Validate boolean fields
    const finalUpdates = {
      ...dbUpdates,
      is_resident_in_italy: Boolean(dbUpdates.is_resident_in_italy),
      updated_at: new Date().toISOString()
    };

    console.log('[updateOwner] Attempting to update with validated data:', { id, finalUpdates });

    const { error } = await supabase
      .from('owners')
      .update(finalUpdates)
      .eq('id', id);

    if (error) {
      console.error('[updateOwner] Supabase error:', error);
      handleDashboardError(error, 'UPDATE', 'owner');
      return null;
    }

    // Enhanced owner update activity logging
    const ownerName = `${updatedOwner.firstName} ${updatedOwner.lastName}`;
    const updatedFields = Object.keys(updates);
    await ActivityLogger.logOwnerUpdated(userId, id, ownerName, updatedFields);

    toast.success('Owner updated successfully');
    logOperation('UPDATE_SUCCESS', 'owner', id, { ownerName });
    return { id, ...updates } as Owner;
  } catch (error: any) {
    console.error('[updateOwner] Error:', error);
    handleDashboardError(error, 'UPDATE', 'owner');
    return null;
  }
};

export const updateProperty = async (id: string, updates: Partial<Property>, userId: string, currentProperty: Property) => {
  logOperation('UPDATE', 'property', id, { userId, updates });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'updateProperty');
    }

    const updatedProperty = { ...currentProperty, ...updates };
    const dbUpdates = transformPropertyToDb(updatedProperty);

    console.log('[updateProperty] Attempting to update:', { id, dbUpdates });

    const { error } = await supabase
      .from('properties')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[updateProperty] Supabase error:', error);
      handleDashboardError(error, 'UPDATE', 'property');
      return null;
    }

    // Enhanced property update activity logging
    const updatedFields = Object.keys(updates);
    await ActivityLogger.logPropertyUpdated(userId, id, updatedProperty.label, updatedFields);

    toast.success('Property updated successfully');
    logOperation('UPDATE_SUCCESS', 'property', id, { label: updatedProperty.label });
    return { id, ...updates } as Property;
  } catch (error: any) {
    console.error('[updateProperty] Error:', error);
    handleDashboardError(error, 'UPDATE', 'property');
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
  logOperation('UPDATE', 'assignment', id, { userId, updates });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'updateAssignment');
    }

    const dbUpdates: any = {};
    if (updates.propertyId) dbUpdates.property_id = updates.propertyId;
    if (updates.ownerId) dbUpdates.owner_id = updates.ownerId;
    if (updates.ownershipPercentage !== undefined) dbUpdates.ownership_percentage = updates.ownershipPercentage;
    if (updates.residentAtProperty !== undefined) dbUpdates.resident_at_property = Boolean(updates.residentAtProperty);
    
    // Enhanced date handling with validation
    if (updates.residentDateRange?.from !== undefined) {
      dbUpdates.resident_from_date = updates.residentDateRange?.from ? 
        (updates.residentDateRange.from instanceof Date ? 
          updates.residentDateRange.from.toISOString().split('T')[0] : 
          new Date(updates.residentDateRange.from).toISOString().split('T')[0]
        ) : null;
    }
    
    if (updates.residentDateRange?.to !== undefined) {
      dbUpdates.resident_to_date = updates.residentDateRange?.to ? 
        (updates.residentDateRange.to instanceof Date ? 
          updates.residentDateRange.to.toISOString().split('T')[0] : 
          new Date(updates.residentDateRange.to).toISOString().split('T')[0]
        ) : null;
    }
    
    if (updates.taxCredits !== undefined) dbUpdates.tax_credits = updates.taxCredits;

    console.log('[updateAssignment] Attempting to update with validated data:', { id, dbUpdates });

    const { error } = await supabase
      .from('owner_property_assignments')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[updateAssignment] Supabase error:', error);
      handleDashboardError(error, 'UPDATE', 'assignment');
      return null;
    }

    // Get current assignment for activity logging
    const owner = owners.find(o => o.id === currentAssignment.ownerId);
    const property = properties.find(p => p.id === currentAssignment.propertyId);
    
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
    const propertyLabel = property?.label || 'Unknown Property';

    await ActivityLogger.logAssignmentUpdated(userId, id, ownerName, propertyLabel);

    toast.success('Assignment updated successfully');
    logOperation('UPDATE_SUCCESS', 'assignment', id, { ownerName, propertyLabel });
    return { id, ...updates } as AssignmentWithId;
  } catch (error: any) {
    console.error('[updateAssignment] Error:', error);
    handleDashboardError(error, 'UPDATE', 'assignment');
    return null;
  }
};

export const deleteOwner = async (id: string, userId: string, ownerToDelete?: Owner) => {
  logOperation('DELETE', 'owner', id, { userId });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'deleteOwner');
    }

    // Get owner data for activity logging before deletion
    const ownerName = ownerToDelete ? `${ownerToDelete.firstName} ${ownerToDelete.lastName}` : 'Unknown Owner';

    console.log('[deleteOwner] Attempting to delete:', { id, ownerName });

    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteOwner] Supabase error:', error);
      handleDashboardError(error, 'DELETE', 'owner');
      return false;
    }

    // Enhanced owner deletion activity logging
    await ActivityLogger.logOwnerDeleted(userId, id, ownerName);

    toast.success('Owner deleted successfully');
    logOperation('DELETE_SUCCESS', 'owner', id, { ownerName });
    return true;
  } catch (error: any) {
    console.error('[deleteOwner] Error:', error);
    handleDashboardError(error, 'DELETE', 'owner');
    return false;
  }
};

export const deleteProperty = async (id: string, userId: string, propertyToDelete?: Property) => {
  logOperation('DELETE', 'property', id, { userId });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'deleteProperty');
    }

    // Get property data for activity logging before deletion
    const propertyLabel = propertyToDelete?.label || 'Unknown Property';

    console.log('[deleteProperty] Attempting to delete:', { id, propertyLabel });

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteProperty] Supabase error:', error);
      handleDashboardError(error, 'DELETE', 'property');
      return false;
    }

    // Enhanced property deletion activity logging
    await ActivityLogger.logPropertyDeleted(userId, id, propertyLabel);

    toast.success('Property deleted successfully');
    logOperation('DELETE_SUCCESS', 'property', id, { propertyLabel });
    return true;
  } catch (error: any) {
    console.error('[deleteProperty] Error:', error);
    handleDashboardError(error, 'DELETE', 'property');
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
  logOperation('DELETE', 'assignment', id, { userId });
  
  try {
    if (!userId) {
      throw new DashboardError('User ID is required', 'MISSING_USER_ID', null, 'deleteAssignment');
    }

    // Get assignment data for activity logging before deletion
    let ownerName = 'Unknown Owner';
    let propertyLabel = 'Unknown Property';

    if (assignmentToDelete) {
      const owner = owners.find(o => o.id === assignmentToDelete.ownerId);
      const property = properties.find(p => p.id === assignmentToDelete.propertyId);
      
      ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
      propertyLabel = property?.label || 'Unknown Property';
    }

    console.log('[deleteAssignment] Attempting to delete:', { id, ownerName, propertyLabel });

    const { error } = await supabase
      .from('owner_property_assignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteAssignment] Supabase error:', error);
      handleDashboardError(error, 'DELETE', 'assignment');
      return false;
    }

    // Enhanced assignment deletion activity logging
    await ActivityLogger.logAssignmentDeleted(userId, id, ownerName, propertyLabel);

    toast.success('Assignment deleted successfully');
    logOperation('DELETE_SUCCESS', 'assignment', id, { ownerName, propertyLabel });
    return true;
  } catch (error: any) {
    console.error('[deleteAssignment] Error:', error);
    handleDashboardError(error, 'DELETE', 'assignment');
    return false;
  }
};
