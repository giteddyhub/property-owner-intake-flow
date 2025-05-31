import { supabase } from '@/integrations/supabase/client';
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';
import { AccountDetails, FormSubmission } from './types';

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
    recent_activities: userSummary.recent_activities || 0
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

export const fetchSubmissions = async (userId: string, primarySubmissionId?: string): Promise<FormSubmission[]> => {
  const { data: submissionsData } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('user_id', userId)
    .neq('state', 'tax_filing_init')
    .in('state', ['new', 'processing', 'completed', 'error'])
    .order('submitted_at', { ascending: false });

  return submissionsData?.map(submission => ({
    ...submission,
    is_primary_submission: submission.id === primarySubmissionId
  })) || [];
};

export const fetchProperties = async (userId: string): Promise<PropertyData[]> => {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
};

export const fetchOwners = async (userId: string): Promise<OwnerData[]> => {
  const { data } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
};

export const fetchAssignments = async (userId: string): Promise<AssignmentData[]> => {
  const { data } = await supabase
    .from('owner_property_assignments')
    .select(`
      *,
      properties!owner_property_assignments_property_id_fkey (label),
      owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data?.map(assignment => ({
    ...assignment,
    property_label: assignment.properties?.label || 'Unknown Property',
    owner_name: assignment.owners ? 
      `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
  })) || [];
};

export const fetchActivities = async (userId: string): Promise<UserActivityData[]> => {
  const { data } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data?.map(activity => ({
    ...activity,
    metadata: (activity.metadata as any) || {}
  })) || [];
};

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  if (submissionIds.length === 0) return [];

  const { data } = await supabase
    .from('purchases')
    .select(`
      *,
      form_submissions:form_submission_id (state)
    `)
    .in('form_submission_id', submissionIds)
    .order('created_at', { ascending: false });

  return data || [];
};
