
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  properties_count: number;
  owners_count: number;
}

export const useCleanAdminData = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { adminSession } = useAdminAuth();

  const logAdminAction = async (action: string, targetType?: string, targetId?: string, details?: any) => {
    if (!adminSession?.token) return;
    
    try {
      await supabase.rpc('log_admin_action', {
        admin_token: adminSession.token,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || {}
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  const fetchUserData = async () => {
    if (!adminSession?.token) {
      setError('No admin session available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Log the data access
      await logAdminAction('admin_dashboard_access', 'system', undefined, {
        section: 'user_data',
        timestamp: new Date().toISOString()
      });

      // Use the admin-tools edge function for secure data access
      const { data, error: functionError } = await supabase.functions.invoke('admin-tools', {
        body: { 
          action: 'fetch_user_profiles_with_stats'
        },
        headers: {
          'x-admin-token': adminSession.token
        }
      });

      if (functionError) {
        throw new Error(`Admin tools function error: ${functionError.message}`);
      }

      if (!data || !data.profiles) {
        throw new Error('No user data returned from admin tools');
      }

      setUsers(data.profiles);
      
      // Log successful data retrieval
      await logAdminAction('user_data_retrieved', 'system', undefined, {
        user_count: data.profiles.length,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message || 'Failed to fetch user data');
      
      // Log the error
      await logAdminAction('user_data_fetch_error', 'system', undefined, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      toast.error('Failed to fetch user data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.token) {
      fetchUserData();
    }
  }, [adminSession]);

  return {
    users,
    loading,
    error,
    refetch: fetchUserData,
    logAdminAction
  };
};
