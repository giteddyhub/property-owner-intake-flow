
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Fetch admin users directly without using any function that might cause recursion
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id');
        
      if (adminError) {
        console.error('[AdminUsers] Error fetching admin users:', adminError);
        throw adminError;
      }
      
      console.log('[AdminUsers] Admin users found:', adminData?.length || 0);
      setUsers(userData || []);
      setAdminUsers(adminData?.map(admin => admin.id) || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
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

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    adminUsers,
    loading,
    fetchUsers,
    addUser,
    toggleAdminStatus,
    isAdmin: (userId: string) => adminUsers.includes(userId)
  };
};
