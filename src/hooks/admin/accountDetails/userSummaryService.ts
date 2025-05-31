
import { supabase } from '@/integrations/supabase/client';
import { AccountDetails } from './types';

export const fetchUserSummary = async (id: string): Promise<AccountDetails> => {
  const { data: userSummary, error: summaryError } = await supabase
    .from('admin_user_summary')
    .select('*')
    .eq('id', id)
    .single();

  if (summaryError || !userSummary) {
    throw new Error('Account not found');
  }

  // Transform the admin_user_summary data to match AccountDetails interface
  return {
    id: userSummary.id,
    email: userSummary.email,
    full_name: userSummary.full_name,
    created_at: userSummary.created_at,
    updated_at: userSummary.created_at, // View doesn't track updated_at, use created_at
    is_admin: false, // Will be set later by checkAdminStatus
    primary_submission_id: userSummary.primary_submission_id,
    total_revenue: Number(userSummary.total_revenue || 0),
    last_submission_date: userSummary.last_submission_date,
    recent_activities: userSummary.recent_activities || 0,
    // Add the missing properties with default values (will be overridden later)
    submissions_count: 0,
    properties_count: 0,
    owners_count: 0
  };
};

export const checkAdminStatus = async (email: string): Promise<boolean> => {
  const { data: adminData } = await supabase
    .from('admin_credentials')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  return !!adminData;
};
