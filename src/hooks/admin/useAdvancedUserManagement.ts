
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuditLog } from './useAuditLog';
import { useUserDeletion } from './useUserDeletion';

export interface UserAction {
  id: string;
  type: 'suspend' | 'activate' | 'reset_password' | 'send_email' | 'delete_account';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
}

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: string[];
}

export const useAdvancedUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { deleteUser } = useUserDeletion();

  const availableActions: UserAction[] = [
    {
      id: 'suspend',
      type: 'suspend',
      label: 'Suspend Account',
      description: 'Temporarily disable user access',
      severity: 'high',
      requiresConfirmation: true
    },
    {
      id: 'activate',
      type: 'activate',
      label: 'Activate Account',
      description: 'Enable user access',
      severity: 'medium',
      requiresConfirmation: false
    },
    {
      id: 'reset_password',
      type: 'reset_password',
      label: 'Force Password Reset',
      description: 'Require user to change password on next login',
      severity: 'medium',
      requiresConfirmation: true
    },
    {
      id: 'send_email',
      type: 'send_email',
      label: 'Send Notification',
      description: 'Send email to user',
      severity: 'low',
      requiresConfirmation: false
    },
    {
      id: 'delete_account',
      type: 'delete_account',
      label: 'Delete Account',
      description: 'Permanently remove user and all data',
      severity: 'high',
      requiresConfirmation: true
    }
  ];

  const executeUserAction = async (
    userId: string,
    userEmail: string,
    action: UserAction['type'],
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      if (action === 'delete_account') {
        // Use the real deletion function
        await deleteUser(userId);
        
        await logAction(
          `user_${action}`,
          'user',
          userId,
          { user_email: userEmail, reason, action }
        );

        return true;
      } else {
        // Mock implementation for other actions - in production would make actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await logAction(
          `user_${action}`,
          'user',
          userId,
          { user_email: userEmail, reason, action }
        );

        toast({
          title: "Action Completed",
          description: `Successfully executed ${action} for ${userEmail}`,
        });

        return true;
      }
    } catch (error: any) {
      console.error(`Failed to execute ${action}:`, error);
      toast({
        title: "Action Failed",
        description: `Failed to execute ${action}: ${error.message}`,
        type: "error"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const executeBulkAction = async (
    userIds: string[],
    action: UserAction['type'],
    reason?: string
  ): Promise<BulkActionResult> => {
    setLoading(true);
    const results: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      for (const userId of userIds) {
        try {
          if (action === 'delete_account') {
            // Use the real deletion function for bulk deletion
            await deleteUser(userId);
          } else {
            // Mock implementation for other actions
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          await logAction(
            `bulk_${action}`,
            'user',
            userId,
            { reason, action, batch_size: userIds.length }
          );
          
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Failed for user ${userId}: ${error.message}`);
        }
      }

      await logAction(
        'bulk_operation_completed',
        'system',
        undefined,
        { 
          action, 
          total_users: userIds.length, 
          success: results.success, 
          failed: results.failed,
          reason 
        }
      );

      toast({
        title: "Bulk Operation Completed",
        description: `${results.success} successful, ${results.failed} failed`,
      });

    } catch (error: any) {
      console.error('Bulk operation failed:', error);
      toast({
        title: "Bulk Operation Failed",
        description: error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }

    return results;
  };

  const getUserActivitySummary = async (userId: string) => {
    try {
      // Mock user activity data
      return {
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        loginCount: 42,
        submissionsCount: 3,
        propertiesCount: 2,
        isActive: true,
        accountAge: 180, // days
        riskScore: 'low' as const
      };
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return null;
    }
  };

  return {
    loading,
    availableActions,
    executeUserAction,
    executeBulkAction,
    getUserActivitySummary
  };
};
