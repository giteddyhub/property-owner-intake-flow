
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

  // Fetch users and admin data
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      console.log('[AdminUsers] Fetching profiles data');
      // Fetch all users from profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });
        
      if (userError) throw userError;
      
      console.log('[AdminUsers] Fetching admin data');
      
      try {
        // Try to fetch admin users directly first
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id');
          
        if (adminError) {
          console.error('[AdminUsers] Error fetching admin users from table:', adminError);
          throw adminError;
        }
        
        console.log('[AdminUsers] Admin users found:', adminData?.length || 0);
        setUsers(userData || []);
        setAdminUsers(adminData?.map(admin => admin.id) || []);
      } catch (adminError) {
        // Fallback: If the direct query fails, try using the stored function
        console.log('[AdminUsers] Trying alternative method to fetch admin users');
        
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
          setUsers(userData);
          setAdminUsers(adminIds);
        }
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
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
    fetchUsers,
    addUser,
    toggleAdminStatus,
    isAdmin: (userId: string) => adminUsers.includes(userId),
    filter,
    setFilter
  };
};
