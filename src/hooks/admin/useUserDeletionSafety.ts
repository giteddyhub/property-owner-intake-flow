
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';

export interface UserSafetyCheck {
  canDelete: boolean;
  isCurrentUser: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  warnings: string[];
  blockingReasons: string[];
}

export interface UserExportData {
  profile: any;
  properties: any[];
  owners: any[];
  submissions: any[];
  assignments: any[];
  activities: any[];
}

export const useUserDeletionSafety = () => {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(false);

  // Check if user can be safely deleted
  const checkUserSafety = useCallback(async (userId: string, userEmail: string): Promise<UserSafetyCheck> => {
    const safety: UserSafetyCheck = {
      canDelete: true,
      isCurrentUser: false,
      isAdmin: false,
      isSuperAdmin: false,
      warnings: [],
      blockingReasons: []
    };

    try {
      // Check if user is trying to delete themselves
      if (admin && userId === admin.id) {
        safety.isCurrentUser = true;
        safety.canDelete = false;
        safety.blockingReasons.push('You cannot delete your own admin account');
      }

      // Check if target user is an admin
      const adminClient = getAuthenticatedAdminClient();
      const { data: adminCheck } = await adminClient
        .from('admin_credentials')
        .select('id, is_super_admin')
        .eq('email', userEmail)
        .maybeSingle();

      if (adminCheck) {
        safety.isAdmin = true;
        safety.isSuperAdmin = adminCheck.is_super_admin;
        
        if (adminCheck.is_super_admin) {
          safety.canDelete = false;
          safety.blockingReasons.push('Super admin accounts cannot be deleted for security reasons');
        } else {
          safety.warnings.push('This user is an admin. Deletion will remove their administrative privileges');
        }
      }

      return safety;
    } catch (error) {
      console.error('Error checking user safety:', error);
      safety.canDelete = false;
      safety.blockingReasons.push('Unable to verify user safety - deletion blocked');
      return safety;
    }
  }, [admin]);

  // Export user data for compliance
  const exportUserData = useCallback(async (userId: string): Promise<UserExportData | null> => {
    setLoading(true);
    
    try {
      const adminClient = getAuthenticatedAdminClient();
      
      // Fetch all user data
      const [profileResult, propertiesResult, ownersResult, submissionsResult, assignmentsResult, activitiesResult] = await Promise.all([
        adminClient.from('profiles').select('*').eq('id', userId).maybeSingle(),
        adminClient.from('properties').select('*').eq('user_id', userId),
        adminClient.from('owners').select('*').eq('user_id', userId),
        adminClient.from('form_submissions').select('*').eq('user_id', userId),
        adminClient.from('owner_property_assignments').select('*').eq('user_id', userId),
        adminClient.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100)
      ]);

      const exportData: UserExportData = {
        profile: profileResult.data || {},
        properties: propertiesResult.data || [],
        owners: ownersResult.data || [],
        submissions: submissionsResult.data || [],
        assignments: assignmentsResult.data || [],
        activities: activitiesResult.data || []
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Failed to export user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download user data as JSON file
  const downloadUserData = useCallback(async (userId: string, userEmail: string) => {
    const exportData = await exportUserData(userId);
    
    if (!exportData) return;

    const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${userEmail}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('User data exported successfully');
  }, [exportUserData]);

  // Soft delete user (deactivate instead of permanent deletion)
  const softDeleteUser = useCallback(async (userId: string, userEmail: string, reason: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const adminClient = getAuthenticatedAdminClient();
      const adminToken = localStorage.getItem('admin_session') 
        ? JSON.parse(localStorage.getItem('admin_session')!).session?.token 
        : null;

      if (!adminToken) {
        throw new Error('No admin token available');
      }

      // Update user profile to mark as deactivated
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ 
          full_name: `[DEACTIVATED] ${userEmail}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Log the soft deletion
      const { error: logError } = await adminClient.rpc('log_admin_action', {
        admin_token: adminToken,
        action: 'user_account_deactivated',
        target_type: 'user',
        target_id: userId,
        details: {
          target_email: userEmail,
          reason: reason,
          action_type: 'soft_delete',
          timestamp: new Date().toISOString()
        }
      });

      if (logError) {
        console.error('Failed to log soft deletion:', logError);
      }

      toast.success('User account deactivated successfully', {
        description: `${userEmail} has been deactivated instead of permanently deleted`
      });

      return true;
    } catch (error: any) {
      console.error('Failed to soft delete user:', error);
      toast.error('Failed to deactivate user account', {
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    checkUserSafety,
    exportUserData,
    downloadUserData,
    softDeleteUser
  };
};
