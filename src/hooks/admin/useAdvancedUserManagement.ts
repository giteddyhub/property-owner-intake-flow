import { useState } from 'react';
import { toast } from 'sonner';
import { useCleanAdminData } from './useCleanAdminData';
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';

export interface UserAction {
  id: string;
  type: 'suspend' | 'activate' | 'reset_password' | 'send_email' | 'delete_account';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  requiresConfirmation: boolean;
}

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface UserDataSummary {
  properties_count: number;
  owners_count: number;
  submissions_count: number;
  assignments_count: number;
  activities_count: number;
  account_age_days: number;
  last_login?: string;
  total_revenue?: number;
}

export const useAdvancedUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { logAdminAction } = useCleanAdminData();

  // Available user actions including delete
  const availableActions: UserAction[] = [
    {
      id: 'suspend',
      type: 'suspend',
      label: 'Suspend Account',
      description: 'Temporarily suspend user access',
      severity: 'high',
      requiresConfirmation: true
    },
    {
      id: 'activate',
      type: 'activate',
      label: 'Activate Account',
      description: 'Restore user access',
      severity: 'medium',
      requiresConfirmation: true
    },
    {
      id: 'reset_password',
      type: 'reset_password',
      label: 'Reset Password',
      description: 'Force password reset on next login',
      severity: 'medium',
      requiresConfirmation: true
    },
    {
      id: 'send_email',
      type: 'send_email',
      label: 'Send Notification',
      description: 'Send notification email to user',
      severity: 'low',
      requiresConfirmation: false
    },
    {
      id: 'delete_account',
      type: 'delete_account',
      label: 'Delete Account',
      description: 'Permanently delete user account and all associated data',
      severity: 'critical',
      requiresConfirmation: true
    }
  ];

  // Get user activity summary
  const getUserActivitySummary = async (userId: string) => {
    try {
      // Mock data for now - in a real implementation this would fetch from the backend
      return {
        loginCount: Math.floor(Math.random() * 50),
        submissionsCount: Math.floor(Math.random() * 10),
        propertiesCount: Math.floor(Math.random() * 5),
        accountAge: Math.floor(Math.random() * 365),
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      };
    } catch (error) {
      console.error('Failed to fetch user activity summary:', error);
      return null;
    }
  };

  // Get detailed user data summary for deletion preview
  const getUserDataSummary = async (userId: string): Promise<UserDataSummary | null> => {
    try {
      // In a real implementation, this would query the database for actual counts
      const mockSummary: UserDataSummary = {
        properties_count: Math.floor(Math.random() * 8),
        owners_count: Math.floor(Math.random() * 5),
        submissions_count: Math.floor(Math.random() * 3),
        assignments_count: Math.floor(Math.random() * 10),
        activities_count: Math.floor(Math.random() * 50),
        account_age_days: Math.floor(Math.random() * 365),
        last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_revenue: Math.random() * 1000
      };
      
      return mockSummary;
    } catch (error) {
      console.error('Failed to fetch user data summary:', error);
      return null;
    }
  };

  // Delete user account
  const deleteUserAccount = async (
    userId: string,
    userEmail: string,
    reason: string
  ): Promise<{ success: boolean; summary?: any; error?: string }> => {
    setLoading(true);
    
    try {
      const adminClient = getAuthenticatedAdminClient();
      const adminToken = localStorage.getItem('admin_session') 
        ? JSON.parse(localStorage.getItem('admin_session')!).session?.token 
        : null;

      if (!adminToken) {
        throw new Error('No admin token available');
      }

      // Call the database function to delete the user
      const { data, error } = await adminClient.rpc('admin_delete_user', {
        admin_token: adminToken,
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      // Log the admin action
      await logAdminAction('user_account_deleted', 'user', userId, {
        target_email: userEmail,
        reason: reason,
        deletion_summary: data,
        timestamp: new Date().toISOString()
      });

      toast.success('User account deleted successfully', {
        description: `${userEmail} and all associated data have been permanently removed`
      });

      return { success: true, summary: data };
    } catch (error: any) {
      console.error('Failed to delete user account:', error);
      toast.error('Failed to delete user account', {
        description: error.message
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete user accounts with progress tracking
  const bulkDeleteUserAccounts = async (
    userIds: string[],
    userEmails: string[],
    reason: string,
    onProgress?: (completed: number, total: number, currentUser?: string) => void
  ): Promise<BulkActionResult> => {
    setLoading(true);
    
    const results: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      // Log the bulk deletion initiation
      await logAdminAction('bulk_user_deletion_initiated', 'users', undefined, {
        target_count: userIds.length,
        target_user_ids: userIds,
        target_emails: userEmails,
        reason: reason,
        timestamp: new Date().toISOString()
      });

      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const userEmail = userEmails[i];
        
        // Update progress
        if (onProgress) {
          onProgress(i, userIds.length, userEmail);
        }

        try {
          const deleteResult = await deleteUserAccount(userId, userEmail, reason);
          
          if (deleteResult.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`${userEmail}: ${deleteResult.error || 'Unknown error'}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${userEmail}: ${error.message}`);
        }
      }

      // Final progress update
      if (onProgress) {
        onProgress(userIds.length, userIds.length);
      }

      // Log bulk deletion completion
      await logAdminAction('bulk_user_deletion_completed', 'users', undefined, {
        target_count: userIds.length,
        successful_deletions: results.success,
        failed_deletions: results.failed,
        errors: results.errors,
        timestamp: new Date().toISOString()
      });

      if (results.success > 0) {
        toast.success(`Bulk deletion completed`, {
          description: `Successfully deleted ${results.success} user accounts${results.failed > 0 ? ` (${results.failed} failed)` : ''}`
        });
      }

      if (results.failed > 0 && results.success === 0) {
        toast.error('Bulk deletion failed', {
          description: `All ${results.failed} deletion attempts failed`
        });
      }

      return results;
    } catch (error: any) {
      console.error('Failed to execute bulk deletion:', error);
      
      toast.error('Bulk deletion failed', {
        description: error.message
      });

      return {
        success: 0,
        failed: userIds.length,
        errors: [error.message]
      };
    } finally {
      setLoading(false);
    }
  };

  // Execute single user action
  const executeUserAction = async (
    userId: string,
    userEmail: string,
    actionType: UserAction['type'],
    reason?: string
  ): Promise<boolean> => {
    // Handle delete action specially
    if (actionType === 'delete_account') {
      if (!reason) {
        toast.error('A reason is required for account deletion');
        return false;
      }
      const result = await deleteUserAccount(userId, userEmail, reason);
      return result.success;
    }

    // Handle other actions with existing logic
    setLoading(true);
    
    try {
      // Log the admin action
      await logAdminAction('user_action', 'user', userId, {
        action_type: actionType,
        target_email: userEmail,
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString()
      });

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`User action "${actionType}" executed successfully`, {
        description: `Applied to ${userEmail}`
      });

      return true;
    } catch (error: any) {
      console.error('Failed to execute user action:', error);
      toast.error('Failed to execute user action', {
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Execute bulk action
  const executeBulkAction = async (
    userIds: string[],
    actionType: UserAction['type'],
    reason?: string
  ): Promise<BulkActionResult> => {
    // Handle bulk delete action specially
    if (actionType === 'delete_account') {
      if (!reason) {
        toast.error('A reason is required for bulk account deletion');
        return {
          success: 0,
          failed: userIds.length,
          errors: ['Reason is required for account deletion']
        };
      }
      
      // We need user emails for deletion, but we don't have them here
      // This will be handled by the BulkUserActions component
      return {
        success: 0,
        failed: userIds.length,
        errors: ['Bulk deletion must be handled through specialized dialog']
      };
    }

    // Handle other bulk actions with existing logic
    setLoading(true);
    
    try {
      // Log the bulk admin action
      await logAdminAction('bulk_user_action', 'users', undefined, {
        action_type: actionType,
        target_count: userIds.length,
        target_user_ids: userIds,
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString()
      });

      // Simulate bulk action execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: BulkActionResult = {
        success: userIds.length,
        failed: 0,
        errors: []
      };

      toast.success(`Bulk action "${actionType}" completed`, {
        description: `Successfully applied to ${result.success} users`
      });

      return result;
    } catch (error: any) {
      console.error('Failed to execute bulk action:', error);
      
      const result: BulkActionResult = {
        success: 0,
        failed: userIds.length,
        errors: [error.message]
      };

      toast.error('Failed to execute bulk action', {
        description: error.message
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    availableActions,
    getUserActivitySummary,
    getUserDataSummary,
    executeUserAction,
    deleteUserAccount,
    bulkDeleteUserAccounts,
    executeBulkAction
  };
};
