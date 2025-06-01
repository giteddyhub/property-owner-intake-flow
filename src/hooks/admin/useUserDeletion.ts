
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

      // Show success toast with details - with proper type checking
      const deletedRecords = data.deleted_records;
      const deletedRecordsTotal = deletedRecords ? 
        (typeof deletedRecords.properties === 'number' ? deletedRecords.properties : 0) + 
        (typeof deletedRecords.owners === 'number' ? deletedRecords.owners : 0) + 
        (typeof deletedRecords.form_submissions === 'number' ? deletedRecords.form_submissions : 0) + 
        (typeof deletedRecords.assignments === 'number' ? deletedRecords.assignments : 0) + 
        (typeof deletedRecords.user_activities === 'number' ? deletedRecords.user_activities : 0) : 0;

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
