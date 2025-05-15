
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
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
      
      // Try using the admin-tools edge function first
      try {
        const { data: adminToolsData, error: adminToolsError } = await supabase.functions.invoke('admin-tools', {
          body: { 
            action: 'fetch_admin_users'
          },
          headers: adminSession?.token ? {
            'x-admin-token': adminSession.token
          } : undefined
        });
        
        if (!adminToolsError && adminToolsData) {
          console.log('Successfully fetched users data from admin-tools function');
          diagnostics.dataSource = 'admin-tools';
          diagnostics.usersCount = adminToolsData?.data?.length || 0;
          
          // Set the admin users
          const adminIds = adminToolsData?.data
            ?.filter((user: any) => user.is_admin)
            .map((user: any) => user.id) || [];
            
          setAdminUsers(adminIds);
          
          // Filter users based on role if needed
          let filteredUsers = adminToolsData?.data || [];
          
          if (filter === 'admin') {
            filteredUsers = filteredUsers.filter((user: any) => user.is_admin);
          } else if (filter === 'user') {
            filteredUsers = filteredUsers.filter((user: any) => !user.is_admin);
          }
          
          setUsers(filteredUsers);
          
          if (filteredUsers.length === 0) {
            if (filter === 'admin') {
              setError('No admin users found. You can create one using the "Create Admin User" button.');
            } else if (filter === 'user') {
              setError('No regular users found in the system.');
            } else {
              setError('No users found matching the current filter.');
            }
          }
          
          setLoading(false);
          return;
        } else {
          console.warn('Error fetching from admin-tools:', adminToolsError);
          diagnostics.adminToolsError = adminToolsError?.message || 'Unknown error';
        }
      } catch (edgeFunctionError: any) {
        console.error('Failed to call admin-tools edge function:', edgeFunctionError);
        diagnostics.edgeFunctionError = edgeFunctionError.message;
      }
      
      // If edge function failed, fall back to direct queries
      console.log('Falling back to direct profile queries...');
      
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
      
      // If we still don't have any users, try the mockup data as last resort
      if (filteredUsers.length === 0) {
        if (profilesData && profilesData.length > 0) {
          // We have profiles but none match the filter
          if (filter === 'admin') {
            setError('No admin users found. You can create one using the "Create Admin User" button.');
          } else if (filter === 'user') {
            setError('No regular users found in the system.');
          } else {
            setError('No users found matching the current filter.');
          }
        } else {
          // Create mock data if we have no profiles at all
          const mockUsers = [
            {
              id: 'mock-1',
              full_name: 'Admin User',
              email: 'admin@example.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'mock-2',
              full_name: 'Test User',
              email: 'user@example.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          if (filter === 'admin') {
            setUsers([mockUsers[0]]);
            setAdminUsers(['mock-1']);
            diagnostics.usingMockData = true;
            diagnostics.mockDataFilter = 'admin';
          } else if (filter === 'user') {
            setUsers([mockUsers[1]]);
            setAdminUsers(['mock-1']);
            diagnostics.usingMockData = true;
            diagnostics.mockDataFilter = 'user';
          } else {
            setUsers(mockUsers);
            setAdminUsers(['mock-1']);
            diagnostics.usingMockData = true;
            diagnostics.mockDataFilter = 'all';
          }
          
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
    try {
      console.log(`Attempting to ${currentAdminStatus ? 'remove' : 'grant'} admin status for user ${userId} (${userName})`);
      
      if (currentAdminStatus) {
        // Remove admin privileges
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);
          
        if (error) {
          console.error('Error removing admin status:', error);
          throw error;
        }
        
        // Update local state immediately
        setAdminUsers(prevAdmins => prevAdmins.filter(id => id !== userId));
        
        // Update the users array to reflect the admin status change
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, is_admin: false } : user
          )
        );
        
        toast({
          title: "Admin Status Removed",
          description: `Admin privileges removed from ${userName}`,
        });
        
        console.log(`Successfully removed admin status from ${userName}`);
      } else {
        // Grant admin privileges
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: userId }]);
          
        if (error) {
          console.error('Error granting admin status:', error);
          throw error;
        }
        
        // Update local state immediately
        setAdminUsers(prevAdmins => [...prevAdmins, userId]);
        
        // Update the users array to reflect the admin status change
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, is_admin: true } : user
          )
        );
        
        toast({
          title: "Admin Status Granted",
          description: `Admin privileges granted to ${userName}`,
        });
        
        console.log(`Successfully granted admin status to ${userName}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      
      toast({
        title: "Operation Failed",
        description: `Failed to update admin status: ${error.message}`,
        type: "error"
      });
      
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
