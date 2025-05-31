
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';

interface AccountDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  primary_submission_id?: string;
}

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
}

export const useAccountDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [activities, setActivities] = useState<UserActivityData[]>([]);

  const fetchAccountDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log(`Fetching account details for ID: ${id}`);
      
      // Get admin token from session storage
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) {
        toast.error('Admin session expired. Please log in again.');
        navigate('/admin/login');
        return;
      }

      // Fetch account profile data with primary submission info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, form_submissions!primary_submission_id(id, state)')
        .eq('id', id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        toast.error('Account not found');
        navigate('/admin/accounts');
        return;
      }

      // Check if user is an admin by checking admin_credentials table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', profile.email)
        .maybeSingle();
        
      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }
      
      // Fetch form submissions with enhanced logic
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('user_id', id)
        .neq('state', 'tax_filing_init') // Exclude session initialization entries
        .in('state', ['new', 'processing', 'completed', 'error']) // Only meaningful submissions
        .order('submitted_at', { ascending: false });
        
      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw submissionsError;
      }
      
      // Enhanced submissions with primary submission flag
      const enhancedSubmissions = submissionsData?.map(submission => ({
        ...submission,
        is_primary_submission: submission.id === profile.primary_submission_id
      })) || [];
      
      // Fetch user activities with type casting to handle the metadata field
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent activities
        
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        // Don't throw error for activities as it's not critical
      }
      
      // Convert activities data to match our UserActivityData interface
      const typedActivities: UserActivityData[] = activitiesData?.map(activity => ({
        ...activity,
        metadata: (activity.metadata as any) || {}
      })) || [];
      
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
        
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }
      
      // Fetch owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
        
      if (ownersError) {
        console.error('Error fetching owners:', ownersError);
        throw ownersError;
      }
      
      // Fetch assignments with proper column hints to avoid relationship ambiguity
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select(`
          *,
          properties!owner_property_assignments_property_id_fkey (label),
          owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
        
      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }
      
      // Fetch payments using form_submission_id to link to user (no more contact_id)
      let paymentsData = [];
      
      // If submissions exist, fetch payments data using form_submission_id
      if (enhancedSubmissions && enhancedSubmissions.length > 0) {
        const submissionIds = enhancedSubmissions.map(s => s.id);
        
        const { data: fetchedPayments, error: paymentsError } = await supabase
          .from('purchases')
          .select(`
            *,
            form_submissions:form_submission_id (state)
          `)
          .in('form_submission_id', submissionIds)
          .order('created_at', { ascending: false });
          
        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
        } else {
          paymentsData = fetchedPayments || [];
        }
      }
      
      // Process assignments data
      const enhancedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        property_label: assignment.properties?.label || 'Unknown Property',
        owner_name: assignment.owners ? 
          `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
      })) || [];
      
      setAccount({
        ...profile,
        is_admin: !!adminData
      });
      setSubmissions(enhancedSubmissions);
      setProperties(propertiesData || []);
      setOwners(ownersData || []);
      setAssignments(enhancedAssignments);
      setPayments(paymentsData);
      setActivities(typedActivities);

      console.log('Account details loaded successfully:', {
        profile: profile.email,
        submissions: enhancedSubmissions.length || 0,
        primarySubmission: profile.primary_submission_id,
        properties: propertiesData?.length || 0,
        owners: ownersData?.length || 0,
        assignments: enhancedAssignments.length,
        payments: paymentsData.length,
        activities: typedActivities.length || 0
      });

    } catch (error: any) {
      console.error('Error fetching account details:', error);
      toast.error('Failed to load account details', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchAccountDetails();
  }, [id]);

  return {
    loading,
    account,
    submissions,
    properties,
    owners,
    assignments,
    payments,
    activities,
    refetch: fetchAccountDetails
  };
};
