import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { toast } from 'sonner';
import { useUser } from '@/contexts/auth/AuthContext';
import { OwnerData, PropertyData, AssignmentData } from '@/types/admin';
import { ActivityLogger } from '@/services/activityLogger';

export const useDashboardData = () => {
  const { user } = useUser();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownersError) throw ownersError;
      setOwners(ownersData || []);

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to load dashboard data');
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

      const { error } = await supabase
        .from('owners')
        .insert({
          ...newOwner,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Log owner creation activity
      await ActivityLogger.log({
        userId: user.id,
        activityType: 'owner_added',
        activityDescription: `Added property owner: ${ownerData.first_name} ${ownerData.last_name}`,
        entityType: 'owner',
        entityId: newOwner.id,
        metadata: {
          owner_name: `${ownerData.first_name} ${ownerData.last_name}`,
          italian_tax_code: ownerData.italian_tax_code,
          is_resident_in_italy: ownerData.is_resident_in_italy,
          creation_timestamp: new Date().toISOString()
        }
      });

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

      const { error } = await supabase
        .from('properties')
        .insert({
          ...newProperty,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Log property creation activity
      await ActivityLogger.log({
        userId: user.id,
        activityType: 'property_added',
        activityDescription: `Added property: ${propertyData.label}`,
        entityType: 'property',
        entityId: newProperty.id,
        metadata: {
          property_label: propertyData.label,
          property_type: propertyData.property_type,
          address_comune: propertyData.address_comune,
          activity_2024: propertyData.activity_2024,
          creation_timestamp: new Date().toISOString()
        }
      });

      setProperties(prev => [...prev, newProperty]);
      toast.success('Property added successfully');
      return newProperty;
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error('Failed to add property');
      return null;
    }
  };

  const createAssignment = async (assignmentData: Omit<OwnerPropertyAssignment, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create assignments');
      return null;
    }

    try {
      const newAssignment: OwnerPropertyAssignment = {
        ...assignmentData,
        id: crypto.randomUUID()
      };

      const { error } = await supabase
        .from('owner_property_assignments')
        .insert({
          ...newAssignment,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('owners')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('properties')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('owner_property_assignments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setAssignments(prev =>
        prev.map(assignment => (assignment.id === id ? { ...assignment, ...updates } : assignment))
      );
      toast.success('Assignment updated successfully');
      return { id, ...updates } as OwnerPropertyAssignment;
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
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('owner_property_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
