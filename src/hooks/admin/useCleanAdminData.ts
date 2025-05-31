
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
  primary_submission_id?: string;
  total_revenue: number;
  last_submission_date?: string;
  recent_activities: number;
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

      // Use the new admin_user_summary view for optimized data access
      const { data: userSummaries, error: viewError } = await supabase
        .from('admin_user_summary')
        .select('*')
        .order('created_at', { ascending: false });

      if (viewError) {
        throw new Error(`Failed to fetch user summary data: ${viewError.message}`);
      }

      if (!userSummaries) {
        throw new Error('No user data returned from admin view');
      }

      // Transform the view data to match our UserProfile interface
      const transformedUsers: UserProfile[] = userSummaries.map(summary => ({
        id: summary.id,
        email: summary.email,
        full_name: summary.full_name,
        created_at: summary.created_at,
        updated_at: summary.created_at, // View doesn't have updated_at, use created_at
        submissions_count: summary.total_submissions || 0,
        properties_count: summary.total_properties || 0,
        owners_count: summary.total_owners || 0,
        primary_submission_id: summary.primary_submission_id,
        total_revenue: Number(summary.total_revenue || 0),
        last_submission_date: summary.last_submission_date,
        recent_activities: summary.recent_activities || 0
      }));

      setUsers(transformedUsers);
      
      // Log successful data retrieval
      await logAdminAction('user_data_retrieved', 'system', undefined, {
        user_count: transformedUsers.length,
        timestamp: new Date().toISOString(),
        data_source: 'admin_user_summary_view'
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
