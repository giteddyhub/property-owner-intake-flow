
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';

interface AccountDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  primary_submission_id?: string;
  total_revenue: number;
  last_submission_date?: string;
  recent_activities: number;
}

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
}

export const useOptimizedAccountDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { adminSession, isAdminAuthenticated, checkAdminSession } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [activities, setActivities] = useState<UserActivityData[]>([]);

  const fetchOptimizedAccountDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log(`Fetching optimized account details for ID: ${id}`);
      
      // Check if admin session is valid
      if (!isAdminAuthenticated || !adminSession?.token) {
        console.log('No valid admin session, checking session...');
        const isValid = await checkAdminSession();
        if (!isValid) {
          toast.error('Admin session expired. Please log in again.');
          navigate('/admin/login');
          return;
        }
      }

      // First, get user summary data from the optimized view
      const { data: userSummary, error: summaryError } = await supabase
        .from('admin_user_summary')
        .select('*')
        .eq('id', id)
        .single();

      if (summaryError || !userSummary) {
        toast.error('Account not found');
        navigate('/admin/accounts');
        return;
      }

      // Check admin status using the streamlined approach
      const { data: adminData } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', userSummary.email)
        .maybeSingle();

      // Optimized parallel queries using the new indexes
      const [
        submissionsResult,
        propertiesResult,
        ownersResult,
        assignmentsResult,
        activitiesResult
      ] = await Promise.all([
        // Uses idx_form_submissions_user_primary index
        supabase
          .from('form_submissions')
          .select('*')
          .eq('user_id', id)
          .neq('state', 'tax_filing_init')
          .in('state', ['new', 'processing', 'completed', 'error'])
          .order('submitted_at', { ascending: false }),
        
        // Uses idx_properties_user_created index
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
        
        // Uses idx_owners_user_created index
        supabase
          .from('owners')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
        
        // Uses idx_assignments_user_created index
        supabase
          .from('owner_property_assignments')
          .select(`
            *,
            properties!owner_property_assignments_property_id_fkey (label),
            owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
          `)
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
        
        // Uses idx_user_activities_user_type_date index
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      // Process submissions with primary flag
      const enhancedSubmissions = submissionsResult.data?.map(submission => ({
        ...submission,
        is_primary_submission: submission.id === userSummary.primary_submission_id
      })) || [];

      // Process activities with type safety
      const typedActivities: UserActivityData[] = activitiesResult.data?.map(activity => ({
        ...activity,
        metadata: (activity.metadata as any) || {}
      })) || [];

      // Process assignments with enhanced data
      const enhancedAssignments = assignmentsResult.data?.map(assignment => ({
        ...assignment,
        property_label: assignment.properties?.label || 'Unknown Property',
        owner_name: assignment.owners ? 
          `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
      })) || [];

      // Fetch payments using optimized indexes
      let paymentsData = [];
      if (enhancedSubmissions.length > 0) {
        const submissionIds = enhancedSubmissions.map(s => s.id);
        
        // Uses idx_purchases_submission_status index
        const { data: fetchedPayments } = await supabase
          .from('purchases')
          .select(`
            *,
            form_submissions:form_submission_id (state)
          `)
          .in('form_submission_id', submissionIds)
          .order('created_at', { ascending: false });
          
        paymentsData = fetchedPayments || [];
      }

      // Set all state using the optimized view data
      setAccount({
        ...userSummary,
        updated_at: userSummary.created_at, // View doesn't track updated_at
        is_admin: !!adminData,
        total_revenue: Number(userSummary.total_revenue || 0),
        recent_activities: userSummary.recent_activities || 0
      });
      setSubmissions(enhancedSubmissions);
      setProperties(propertiesResult.data || []);
      setOwners(ownersResult.data || []);
      setAssignments(enhancedAssignments);
      setPayments(paymentsData);
      setActivities(typedActivities);

      console.log('Optimized account details loaded:', {
        profile: userSummary.email,
        submissions: enhancedSubmissions.length,
        properties: propertiesResult.data?.length || 0,
        owners: ownersResult.data?.length || 0,
        assignments: enhancedAssignments.length,
        payments: paymentsData.length,
        activities: typedActivities.length,
        dataSource: 'admin_user_summary_view'
      });

    } catch (error: any) {
      console.error('Error fetching optimized account details:', error);
      toast.error('Failed to load account details', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchOptimizedAccountDetails();
  }, [id, adminSession]);

  return {
    loading,
    account,
    submissions,
    properties,
    owners,
    assignments,
    payments,
    activities,
    refetch: fetchOptimizedAccountDetails
  };
};
