
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/auth/AuthContext';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { fetchDashboardData, AssignmentWithId } from './dataService';
import { fetchUserTotalRevenue } from './revenueService';
import {
  createOwner,
  createProperty,
  createAssignment,
  updateOwner,
  updateProperty,
  updateAssignment,
  deleteOwner,
  deleteProperty,
  deleteAssignment
} from './crudOperations';

export const useDashboardData = () => {
  const { user } = useUser();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithId[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Fetch dashboard data and revenue in parallel
      const [dashboardData, revenue] = await Promise.all([
        fetchDashboardData(user.id),
        fetchUserTotalRevenue(user.id)
      ]);
      
      setOwners(dashboardData.owners);
      setProperties(dashboardData.properties);
      setAssignments(dashboardData.assignments);
      setTotalRevenue(revenue);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error: any) {
      console.error('Error in fetchDashboardData:', error);
      setError(error.message);
      
      // Prevent infinite retry loops
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying fetch (attempt ${retryCount + 1}/${maxRetries})`);
      } else {
        console.error('Max retries reached, stopping fetch attempts');
        if (!error.message?.includes('JWT')) {
          toast.error('Failed to load dashboard data. Please refresh the page.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleCreateOwner = async (ownerData: Omit<Owner, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add owners');
      return null;
    }

    const newOwner = await createOwner(ownerData, user.id);
    if (newOwner) {
      setOwners(prev => [...prev, newOwner]);
    }
    return newOwner;
  };

  const handleCreateProperty = async (propertyData: Omit<Property, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add properties');
      return null;
    }

    const newProperty = await createProperty(propertyData, user.id);
    if (newProperty) {
      setProperties(prev => [...prev, newProperty]);
    }
    return newProperty;
  };

  const handleCreateAssignment = async (assignmentData: OwnerPropertyAssignment) => {
    if (!user) {
      toast.error('You must be logged in to create assignments');
      return null;
    }

    const newAssignment = await createAssignment(assignmentData, user.id, owners, properties);
    if (newAssignment) {
      setAssignments(prev => [...prev, newAssignment]);
    }
    return newAssignment;
  };

  const handleUpdateOwner = async (id: string, updates: Partial<Owner>) => {
    if (!user) {
      toast.error('You must be logged in to update owners');
      return null;
    }

    const currentOwner = owners.find(o => o.id === id);
    if (!currentOwner) throw new Error('Owner not found');

    const updatedOwner = await updateOwner(id, updates, user.id, currentOwner);
    if (updatedOwner) {
      setOwners(prev =>
        prev.map(owner => (owner.id === id ? { ...owner, ...updates } : owner))
      );
    }
    return updatedOwner;
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    if (!user) {
      toast.error('You must be logged in to update properties');
      return null;
    }

    const currentProperty = properties.find(p => p.id === id);
    if (!currentProperty) throw new Error('Property not found');

    const updatedProperty = await updateProperty(id, updates, user.id, currentProperty);
    if (updatedProperty) {
      setProperties(prev =>
        prev.map(property => (property.id === id ? { ...property, ...updates } : property))
      );
    }
    return updatedProperty;
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<OwnerPropertyAssignment>) => {
    if (!user) {
      toast.error('You must be logged in to update assignments');
      return null;
    }

    const currentAssignment = assignments.find(a => a.id === id);
    if (!currentAssignment) throw new Error('Assignment not found');

    const updatedAssignment = await updateAssignment(id, updates, user.id, owners, properties, currentAssignment);
    if (updatedAssignment) {
      setAssignments(prev =>
        prev.map(assignment => (assignment.id === id ? { ...assignment, ...updates } : assignment))
      );
    }
    return updatedAssignment;
  };

  const handleDeleteOwner = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete owners');
      return false;
    }

    const ownerToDelete = owners.find(o => o.id === id);
    const success = await deleteOwner(id, user.id, ownerToDelete);
    if (success) {
      setOwners(prev => prev.filter(owner => owner.id !== id));
    }
    return success;
  };

  const handleDeleteProperty = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete properties');
      return false;
    }

    const propertyToDelete = properties.find(p => p.id === id);
    const success = await deleteProperty(id, user.id, propertyToDelete);
    if (success) {
      setProperties(prev => prev.filter(property => property.id !== id));
    }
    return success;
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete assignments');
      return false;
    }

    const assignmentToDelete = assignments.find(a => a.id === id);
    const success = await deleteAssignment(id, user.id, owners, properties, assignmentToDelete);
    if (success) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    }
    return success;
  };

  return {
    owners,
    properties,
    assignments,
    totalRevenue,
    loading,
    error,
    createOwner: handleCreateOwner,
    createProperty: handleCreateProperty,
    createAssignment: handleCreateAssignment,
    updateOwner: handleUpdateOwner,
    updateProperty: handleUpdateProperty,
    updateAssignment: handleUpdateAssignment,
    deleteOwner: handleDeleteOwner,
    deleteProperty: handleDeleteProperty,
    deleteAssignment: handleDeleteAssignment,
    refetch: fetchData
  };
};
