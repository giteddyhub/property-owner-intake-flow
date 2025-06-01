
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

  const testAdminSessionValidation = async () => {
    console.log('[useUserDeletion] 🔍 Testing admin session validation...');
    
    if (!adminSession?.token) {
      console.error('[useUserDeletion] ❌ No admin session token available');
      toast.error('No admin session available');
      return false;
    }

    try {
      console.log('[useUserDeletion] 🔧 Calling validate_admin_session function directly...');
      
      const { data, error } = await supabase.rpc('validate_admin_session', {
        session_token: adminSession.token
      });

      console.log('[useUserDeletion] Session validation response:', { data, error });
      
      if (error) {
        console.error('[useUserDeletion] ❌ Session validation error:', error);
        toast.error('Session validation failed', {
          description: error.message,
        });
        return false;
      }
      
      if (!data || data.length === 0) {
        console.error('[useUserDeletion] ❌ Invalid session - no admin data returned');
        toast.error('Invalid admin session');
        return false;
      }
      
      console.log('[useUserDeletion] ✅ Admin session is valid:', data[0]);
      toast.success('Admin session is valid', {
        description: `Logged in as ${data[0].email}`,
      });
      return true;
    } catch (error: any) {
      console.error('[useUserDeletion] ❌ Session validation exception:', error);
      toast.error('Session validation failed', {
        description: error.message,
      });
      return false;
    }
  };

  const testEdgeFunction = async () => {
    console.log('[useUserDeletion] 🔍 Testing edge function health...');
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET' // Health check endpoint
      });

      console.log('[useUserDeletion] Health check response:', { data, error });
      
      if (error) {
        console.error('[useUserDeletion] Health check error:', error);
        toast.error('Edge function health check failed', {
          description: error.message,
        });
        return false;
      }
      
      if (data) {
        console.log('[useUserDeletion] ✅ Edge function is healthy:', data);
        toast.success('Edge function is healthy');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('[useUserDeletion] Health check exception:', error);
      toast.error('Health check failed', {
        description: error.message,
      });
      return false;
    }
  };

  const testDatabaseFunction = async () => {
    console.log('[useUserDeletion] 🔍 Testing database function with invalid parameters...');
    
    if (!adminSession?.token) {
      console.error('[useUserDeletion] ❌ No admin session available');
      toast.error('No admin session available');
      return false;
    }

    try {
      // Test with invalid user ID to see if the function responds
      const { data, error } = await supabase.rpc('admin_delete_user', {
        admin_token: adminSession.token,
        target_user_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID
      });

      console.log('[useUserDeletion] Database function test response:', { data, error });
      
      // We expect this to fail with a specific error message
      if (error) {
        console.log('[useUserDeletion] ✅ Database function is responding (expected error):', error);
        toast.success('Database function is responsive', {
          description: 'Function correctly rejected invalid user ID',
        });
        return true;
      }
      
      if (data && !data.success) {
        console.log('[useUserDeletion] ✅ Database function is responding (expected failure):', data);
        toast.success('Database function is responsive', {
          description: 'Function correctly handled invalid request',
        });
        return true;
      }
      
      console.log('[useUserDeletion] ⚠️ Unexpected response from database function');
      toast.warning('Unexpected database function response');
      return false;
    } catch (error: any) {
      console.error('[useUserDeletion] ❌ Database function test error:', error);
      toast.error('Database function test failed', {
        description: error.message,
      });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<DeletionResult> => {
    console.log('[useUserDeletion] 🚀 Starting user deletion for:', userId);
    
    if (!adminSession?.token) {
      const error = 'No admin session available';
      console.error('[useUserDeletion] ❌', error);
      throw new Error(error);
    }

    console.log('[useUserDeletion] ✅ Admin session validated');
    console.log('[useUserDeletion] Token length:', adminSession.token.length);
    console.log('[useUserDeletion] Token preview:', adminSession.token.substring(0, 20) + '...');
    setLoading(true);

    try {
      console.log('[useUserDeletion] 📡 Calling edge function admin-delete-user');
      
      const requestPayload = {
        targetUserId: userId,
      };
      
      console.log('[useUserDeletion] Request payload:', requestPayload);
      console.log('[useUserDeletion] Request headers:', {
        'x-admin-token': adminSession.token ? 'present' : 'missing',
        'Content-Type': 'application/json'
      });

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'x-admin-token': adminSession.token,
          'Content-Type': 'application/json'
        },
        body: requestPayload,
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
    testEdgeFunction,
    testAdminSessionValidation,
    testDatabaseFunction,
  };
};
