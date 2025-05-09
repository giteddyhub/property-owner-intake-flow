
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export type UserRole = 'admin' | 'user' | 'all';

export const useAdminUsers = (defaultFilter: UserRole = 'all') => {
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole>(defaultFilter);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});
  
  const { isAdminAuthenticated, adminSession } = useAdminAuth();

  const isAdmin = (userId: string) => adminUsers.includes(userId);
  
  // Use explicit SQL query to fetch profiles instead of relying on Supabase client
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
      
      // Set up headers with admin token if available
      let options = {};
      if (adminSession?.token) {
        options = {
          headers: {
            'x-admin-token': adminSession.token
          }
        };
        console.log('Using admin token for authentication');
      } else {
        console.warn('No admin token available');
      }
      
      // First get profiles
      const { data: profilesData, error: profilesError, status: profilesStatus } = await supabase
        .from('profiles')
        .select('*', options);
      
      diagnostics.profilesQueryStatus = profilesStatus;
      
      if (profilesError) {
        diagnostics.profilesError = profilesError.message;
        console.error('Error fetching profiles:', profilesError);
      }
      
      console.log('Profiles data:', profilesData?.length || 0, 'records found');
      diagnostics.profilesCount = profilesData?.length || 0;
      
      // Get admin users separately
      const { data: adminsData, error: adminsError, status: adminsStatus } = await supabase
        .from('admin_users')
        .select('id', options);
        
      diagnostics.adminQueryStatus = adminsStatus;
      
      if (adminsError) {
        diagnostics.adminError = adminsError.message;
        console.error('Error fetching admin users:', adminsError);
      }
      
      console.log('Admin data:', adminsData?.length || 0, 'records found');
      diagnostics.adminCount = adminsData?.length || 0;
      
      // Store admin user IDs
      const adminUserIds = adminsData?.map(admin => admin.id) || [];
      setAdminUsers(adminUserIds);
      
      // Filter users based on role if needed
      let filteredUsers = profilesData || [];
      
      if (filter === 'admin') {
        filteredUsers = filteredUsers.filter(user => adminUserIds.includes(user.id));
      } else if (filter === 'user') {
        filteredUsers = filteredUsers.filter(user => !adminUserIds.includes(user.id));
      }
      
      // Set the filtered users
      setUsers(filteredUsers);
      
      // If we still don't have any users, set an error
      if (filteredUsers.length === 0) {
        if (profilesData && profilesData.length > 0) {
          // We have profiles but none match the filter
          if (filter === 'admin') {
            setError('No admin users found. You can create one using the "Create Admin User" button.');
          } else if (filter === 'user') {
            setError('No regular users found in the system.');
          } else {
            // This shouldn't happen if we have profiles data
            setError('No users found matching the current filter.');
          }
        } else {
          // No profiles found at all
          setError('No user profiles found in the database.');
        }
      } else {
        setError(null);
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
    try {
      if (currentAdminStatus) {
        // Remove admin privileges
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);
          
        if (error) throw error;
        
        // Update local state
        setAdminUsers(prevAdmins => prevAdmins.filter(id => id !== userId));
        toast.success(`Admin privileges removed from ${userName}`);
      } else {
        // Grant admin privileges
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: userId }]);
          
        if (error) throw error;
        
        // Update local state
        setAdminUsers(prevAdmins => [...prevAdmins, userId]);
        toast.success(`Admin privileges granted to ${userName}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error(`Failed to update admin status: ${error.message}`);
      return false;
    }
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
