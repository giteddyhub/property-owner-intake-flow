
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
      const error = 'No admin session available';
      console.error('[useUserDeletion]', error);
      throw new Error(error);
    }

    setLoading(true);

    try {
      console.log('[useUserDeletion] Initiating user deletion for:', userId);

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'x-admin-token': adminSession.token,
        },
        body: {
          targetUserId: userId,
        },
      });

      console.log('[useUserDeletion] Edge function response:', { data, error });

      if (error) {
        console.error('[useUserDeletion] Edge function error:', error);
        throw new Error(error.message || 'Failed to delete user');
      }

      if (!data) {
        const errorMsg = 'No response from deletion service';
        console.error('[useUserDeletion]', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error || 'Deletion failed';
        console.error('[useUserDeletion] Deletion failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[useUserDeletion] User deletion successful:', data);

      // Show success toast with details
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
      console.error('[useUserDeletion] User deletion error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (errorMessage.includes('Invalid admin session')) {
        errorMessage = 'Your admin session has expired. Please refresh the page and try again.';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'The user you are trying to delete no longer exists.';
      } else if (errorMessage.includes('Cannot delete your own admin account')) {
        errorMessage = 'You cannot delete your own admin account.';
      } else if (errorMessage.includes('Database error')) {
        errorMessage = 'A database error occurred. Please try again or contact support.';
      }
      
      toast.error('Failed to delete user', {
        description: errorMessage,
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
