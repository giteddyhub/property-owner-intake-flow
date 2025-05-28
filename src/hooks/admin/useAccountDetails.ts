
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OwnerData, PropertyData, AssignmentData, PaymentData } from '@/types/admin';

interface AccountDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
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

  const fetchAccountDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log(`Fetching account details for ID: ${id}`);
      
      // Fetch the account details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
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
      
      // Fetch submissions - Filter out tax_filing_init submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('user_id', id)
        .neq('state', 'tax_filing_init')
        .order('submitted_at', { ascending: false });
        
      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw submissionsError;
      }
      
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
      
      // Fetch assignments with property and owner details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select(`
          *,
          property:properties!owner_property_assignments_property_id_fkey (label),
          owner:owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
        
      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }
      
      // First fetch contact ID for the user
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', id)
        .limit(1);
        
      if (contactError) {
        console.error('Error fetching contact ID:', contactError);
        throw contactError;
      }
      
      let paymentsData = [];
      
      // If contact ID is found, fetch payments data
      if (contactData && contactData.length > 0) {
        const contactId = contactData[0].id;
        
        const { data: fetchedPayments, error: paymentsError } = await supabase
          .from('purchases')
          .select(`
            *,
            form_submissions:form_submission_id (state)
          `)
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false });
          
        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
          throw paymentsError;
        }
        
        paymentsData = fetchedPayments || [];
      }
      
      const enhancedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        property_label: assignment.property?.label || 'Unknown Property',
        owner_name: assignment.owner ? 
          `${assignment.owner.first_name} ${assignment.owner.last_name}` : 'Unknown Owner'
      })) || [];
      
      setAccount({
        ...profile,
        is_admin: !!adminData
      });
      setSubmissions(submissionsData || []);
      setProperties(propertiesData || []);
      setOwners(ownersData || []);
      setAssignments(enhancedAssignments);
      setPayments(paymentsData);
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
    refetch: fetchAccountDetails
  };
};
