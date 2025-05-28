import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { UserRole, UseAdminUsersReturn } from './types/adminUserTypes';
import { fetchUsersFromAdminTools, fetchUsersDirectly } from './utils/userDataService';
import { filterUsersByRole, createMockUsers, getErrorMessage } from './utils/userFiltering';
import { toggleUserAdminStatus } from './utils/adminStatusActions';

export type { UserRole } from './types/adminUserTypes';

export const useAdminUsers = (defaultFilter: UserRole = 'all'): UseAdminUsersReturn => {
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole>(defaultFilter);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});
  
  const { isAdminAuthenticated, adminSession } = useAdminAuth();

  const isAdmin = (userId: string) => adminUsers.includes(userId);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const diagnostics: any = {};
    
    try {
      console.log('Fetching users with filter:', filter);
      
      // Get current auth status to help diagnose issues
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      diagnostics.hasAuthSession = !!session;
      
      if (authError) {
        diagnostics.authError = authError.message;
        console.error('Auth error:', authError);
      }
      
      // Try using the admin-tools edge function first
      const adminToolsResult = await fetchUsersFromAdminTools(adminSession?.token);
      
      if (adminToolsResult) {
        Object.assign(diagnostics, adminToolsResult.diagnostics);
        setAdminUsers(adminToolsResult.adminUsers);
        
        const filteredUsers = filterUsersByRole(adminToolsResult.users, adminToolsResult.adminUsers, filter);
        setUsers(filteredUsers);
        
        if (filteredUsers.length === 0) {
          setError(getErrorMessage(filter, adminToolsResult.users.length > 0));
        }
        
        setDiagnosticInfo(diagnostics);
        setLoading(false);
        return;
      }
      
      // If edge function failed, fall back to direct queries
      console.log('Falling back to direct profile queries...');
      
      const directResult = await fetchUsersDirectly(adminSession?.token);
      Object.assign(diagnostics, directResult.diagnostics);
      
      console.log('Profiles data:', directResult.users?.length || 0, 'records found');
      console.log('Admin data:', directResult.adminUsers?.length || 0, 'records found');
      
      // Store admin user IDs
      setAdminUsers(directResult.adminUsers);
      
      // Filter users based on role
      const filteredUsers = filterUsersByRole(directResult.users, directResult.adminUsers, filter);
      
      // Set the filtered users
      setUsers(filteredUsers);
      
      // If we still don't have any users, try the mockup data as last resort
      if (filteredUsers.length === 0) {
        if (directResult.users && directResult.users.length > 0) {
          // We have profiles but none match the filter
          setError(getErrorMessage(filter, true));
        } else {
          // Create mock data if we have no profiles at all
          const mockResult = createMockUsers(filter);
          setUsers(mockResult.users);
          setAdminUsers(mockResult.adminUsers);
          Object.assign(diagnostics, mockResult.diagnostics);
          setError('Using mock data. No real user profiles found in the database.');
        }
      }
      
      // Set diagnostic information for debugging
      setDiagnosticInfo(diagnostics);
      
    } catch (error: any) {
      console.error('Error in useAdminUsers:', error);
      setError(error.message || 'Failed to load users data');
      setDiagnosticInfo({
        ...diagnostics,
        unexpectedError: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [filter, adminSession]);
  
  // Add a user to the list (used after creating a new admin)
  const addUser = (userData: any) => {
    setUsers(prevUsers => [userData, ...prevUsers]);
    
    if (userData.is_admin) {
      setAdminUsers(prevAdmins => [...prevAdmins, userData.id]);
    }
  };
  
  // Toggle admin status for a user
  const toggleAdminStatus = async (userId: string, currentAdminStatus: boolean, userName: string) => {
    const success = await toggleUserAdminStatus(userId, currentAdminStatus, userName);
    
    if (success) {
      // Update local state immediately
      if (currentAdminStatus) {
        setAdminUsers(prevAdmins => prevAdmins.filter(id => id !== userId));
      } else {
        setAdminUsers(prevAdmins => [...prevAdmins, userId]);
      }
      
      // Update the users array to reflect the admin status change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_admin: !currentAdminStatus } : user
        )
      );
    }
    
    return success;
  };
  
  // Fetch users on initial load and when filter changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filter]);
  
  return {
    users,
    adminUsers,
    loading,
    error,
    diagnosticInfo,
    fetchUsers,
    addUser,
    toggleAdminStatus,
    isAdmin,
    filter,
    setFilter
  };
};
