
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
  details?: string;
  hint?: string;
  type?: string;
}

export const useUserDeletion = () => {
  const [loading, setLoading] = useState(false);
  const { adminSession } = useAdminAuth();

  const deleteUser = async (userId: string): Promise<DeletionResult> => {
    console.log('[useUserDeletion] 🚀 Starting user deletion for:', userId);
    
    if (!adminSession?.token) {
      const error = 'No admin session available';
      console.error('[useUserDeletion] ❌', error);
      throw new Error(error);
    }

    console.log('[useUserDeletion] ✅ Admin session validated');
    setLoading(true);

    try {
      console.log('[useUserDeletion] 📡 Calling edge function admin-delete-user');
      console.log('[useUserDeletion] Request payload:', {
        targetUserId: userId,
        hasAdminToken: !!adminSession.token
      });

      const requestBody = JSON.stringify({
        targetUserId: userId,
      });

      console.log('[useUserDeletion] Request body stringified:', requestBody);

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'x-admin-token': adminSession.token,
          'Content-Type': 'application/json'
        },
        body: requestBody,
      });

      console.log('[useUserDeletion] 📊 Edge function response received');
      console.log('[useUserDeletion] Data:', data);
      console.log('[useUserDeletion] Error:', error);

      if (error) {
        console.error('[useUserDeletion] ❌ Edge function error:', {
          message: error.message,
          context: error.context,
          details: error.details
        });
        
        // More specific error handling based on error type
        let userFriendlyMessage = error.message || 'Failed to delete user';
        
        if (error.message?.includes('Admin token required')) {
          userFriendlyMessage = 'Your admin session has expired. Please refresh the page and try again.';
        } else if (error.message?.includes('User not found')) {
          userFriendlyMessage = 'The user you are trying to delete no longer exists.';
        } else if (error.message?.includes('Cannot delete your own admin account')) {
          userFriendlyMessage = 'You cannot delete your own admin account.';
        } else if (error.message?.includes('Database connection')) {
          userFriendlyMessage = 'Database connection error. Please try again in a moment.';
        } else if (error.message?.includes('violates foreign key constraint')) {
          userFriendlyMessage = 'Cannot delete user due to database constraints. Please contact support.';
        } else if (error.message?.includes('Invalid JSON')) {
          userFriendlyMessage = 'Request formatting error. Please try again.';
        } else if (error.message?.includes('Request body is required')) {
          userFriendlyMessage = 'Invalid request. Please try again.';
        }
        
        throw new Error(userFriendlyMessage);
      }

      if (!data) {
        const errorMsg = 'No response from deletion service';
        console.error('[useUserDeletion] ❌', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error || 'Deletion failed';
        console.error('[useUserDeletion] ❌ Deletion failed:', {
          error: errorMsg,
          details: data.details,
          hint: data.hint,
          type: data.type
        });
        
        // Show additional details in development
        let fullErrorMessage = errorMsg;
        if (data.details && import.meta.env.DEV) {
          fullErrorMessage += ` (Details: ${data.details})`;
        }
        if (data.hint && import.meta.env.DEV) {
          fullErrorMessage += ` (Hint: ${data.hint})`;
        }
        
        throw new Error(fullErrorMessage);
      }

      console.log('[useUserDeletion] ✅ User deletion successful:', data);

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
      console.error('[useUserDeletion] ❌ User deletion error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
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
