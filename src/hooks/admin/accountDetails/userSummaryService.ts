
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  primary_submission_id?: string;
  total_revenue: number;
  recent_activities: number;
}

export const fetchUserSummary = async (userId: string): Promise<UserSummary> => {
  console.log(`[userSummaryService] 🔍 Fetching user summary for: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: userSummary, error: summaryError } = await adminClient
      .from('admin_user_summary')
      .select('*')
      .eq('id', userId)
      .single();

    if (summaryError) {
      console.error('[userSummaryService] ❌ Error fetching user summary:', summaryError);
      throw new Error(`User summary fetch failed: ${summaryError.message}`);
    }

    if (!userSummary) {
      throw new Error('Account not found');
    }

    console.log(`[userSummaryService] ✅ User summary fetched:`, userSummary);
    return userSummary;
  } catch (error) {
    console.error('[userSummaryService] ❌ Error in fetchUserSummary:', error);
    throw error;
  }
};

export const checkAdminStatus = async (email: string): Promise<boolean> => {
  console.log(`[userSummaryService] 🔍 Checking admin status for: ${email}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: adminData, error: adminError } = await adminClient
      .from('admin_credentials')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (adminError) {
      console.error('[userSummaryService] ❌ Error checking admin status:', adminError);
      return false;
    }

    const isAdmin = !!adminData;
    console.log(`[userSummaryService] ✅ Admin status for ${email}: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error('[userSummaryService] ❌ Error in checkAdminStatus:', error);
    return false;
  }
};
