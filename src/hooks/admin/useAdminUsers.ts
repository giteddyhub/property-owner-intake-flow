
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'user' | 'all';

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export const useAdminUsers = (defaultFilter: UserRole = 'admin') => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserRole>(defaultFilter);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});

  // Fetch users and admin data
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const diagnostics: any = {};
    
    try {
      console.log('[AdminUsers] Fetching profiles data');
      // Get current auth status to help diagnose issues
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      diagnostics.hasAuthSession = !!session;
      if (authError) {
        diagnostics.authError = authError.message;
      }

      // Fetch all users from profiles table
      const { data: userData, error: userError, status: userStatus } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });
        
      diagnostics.profilesQueryStatus = userStatus;

      if (userError) {
        diagnostics.profilesError = userError.message;
        console.error('[AdminUsers] Error fetching profiles:', userError);
        throw userError;
      }
      
      diagnostics.profilesCount = userData?.length || 0;
      console.log('[AdminUsers] Found profiles:', userData?.length || 0);
      
      console.log('[AdminUsers] Fetching admin data');
      
      try {
        // Try to fetch admin users directly first
        const { data: adminData, error: adminError, status: adminStatus } = await supabase
          .from('admin_users')
          .select('id');
          
        diagnostics.adminQueryStatus = adminStatus;
        
        if (adminError) {
          diagnostics.adminError = adminError.message;
          console.error('[AdminUsers] Error fetching admin users from table:', adminError);
          throw adminError;
        }
        
        console.log('[AdminUsers] Admin users found:', adminData?.length || 0);
        diagnostics.adminCount = adminData?.length || 0;
        setUsers(userData || []);
        setAdminUsers(adminData?.map(admin => admin.id) || []);
      } catch (adminError: any) {
        // Fallback: If the direct query fails, try using the stored function
        console.log('[AdminUsers] Trying alternative method to fetch admin users');
        diagnostics.adminFallbackUsed = true;
        
        // Fetch each user's admin status individually to avoid RLS recursion
        const adminIds: string[] = [];
        
        if (userData && userData.length > 0) {
          for (const user of userData) {
            try {
              const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
              
              if (!error && data === true) {
                adminIds.push(user.id);
              }
            } catch (err) {
              console.error(`[AdminUsers] Error checking admin status for user ${user.id}:`, err);
            }
          }
          
          console.log('[AdminUsers] Admin users found (alternative method):', adminIds.length);
          diagnostics.adminFallbackCount = adminIds.length;
          setUsers(userData);
          setAdminUsers(adminIds);
        }
      }

      // Set diagnostic information for troubleshooting
      setDiagnosticInfo(diagnostics);
      
      // If no data was found at all, set a warning
      if ((!userData || userData.length === 0) && diagnostics.profilesQueryStatus === 200) {
        setError("No user profiles found in the database. You may need to create some users first.");
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message || 'Failed to load user data');
      setDiagnosticInfo(diagnostics);
      toast.error('Failed to load user data', {
        description: error.message
      });
      setUsers([]);
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const addUser = (newUser: UserData) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean, userName: string) => {
    try {
      if (isAdmin) {
        // Remove admin privileges
        console.log('[AdminUsers] Removing admin privileges for:', userId);
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);
          
        if (error) throw error;
        
        setAdminUsers(prev => prev.filter(id => id !== userId));
        toast.success(`Admin privileges removed from ${userName}`);
      } else {
        // Grant admin privileges
        console.log('[AdminUsers] Granting admin privileges for:', userId);
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: userId }]);
          
        if (error) throw error;
        
        setAdminUsers(prev => [...prev, userId]);
        toast.success(`Admin privileges granted to ${userName}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
      return false;
    }
  };

  // Filter users based on the selected role
  const filteredUsers = useMemo(() => {
    switch (filter) {
      case 'admin':
        return users.filter(user => adminUsers.includes(user.id));
      case 'user':
        return users.filter(user => !adminUsers.includes(user.id));
      case 'all':
      default:
        return users;
    }
  }, [users, adminUsers, filter]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users: filteredUsers, // Return the filtered users
    allUsers: users, // Access to all users if needed
    adminUsers,
    loading,
    error,
    diagnosticInfo,
    fetchUsers,
    addUser,
    toggleAdminStatus,
    isAdmin: (userId: string) => adminUsers.includes(userId),
    filter,
    setFilter
  };
};
