
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

interface DeletionResult {
  success: boolean;
  deleted_user?: {
    id: string;
    email: string;
    full_name: string;
  };
  deleted_records?: {
    properties: number;
    owners: number;
    form_submissions: number;
    assignments: number;
    user_activities: number;
  };
  error?: string;
}

export const useUserDeletion = () => {
  const [loading, setLoading] = useState(false);
  const { adminSession } = useAdminAuth();

  const deleteUser = async (userId: string): Promise<DeletionResult> => {
    if (!adminSession?.token) {
      throw new Error('No admin session available');
    }

    setLoading(true);

    try {
      console.log('Initiating user deletion for:', userId);

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'x-admin-token': adminSession.token,
        },
        body: {
          targetUserId: userId,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to delete user');
      }

      if (!data) {
        throw new Error('No response from deletion service');
      }

      if (!data.success) {
        throw new Error(data.error || 'Deletion failed');
      }

      console.log('User deletion successful:', data);

      // Show success toast with details
      const deletedRecordsTotal = data.deleted_records ? 
        (data.deleted_records.properties || 0) + 
        (data.deleted_records.owners || 0) + 
        (data.deleted_records.form_submissions || 0) + 
        (data.deleted_records.assignments || 0) + 
        (data.deleted_records.user_activities || 0) : 0;

      toast.success('User deleted successfully', {
        description: `Deleted ${data.deleted_user?.email} and ${deletedRecordsTotal} related records`,
      });

      return data;
    } catch (error: any) {
      console.error('User deletion error:', error);
      
      toast.error('Failed to delete user', {
        description: error.message,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteUser,
    loading,
  };
};
