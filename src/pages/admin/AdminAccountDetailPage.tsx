
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

import { AccountInfoCard } from '@/components/admin/accounts/AccountInfoCard';
import { AccountDetailSkeleton } from '@/components/admin/accounts/AccountDetailSkeleton';
import { AccountNotFound } from '@/components/admin/accounts/AccountNotFound';
import { 
  AccountAdminDialog,
  AdminActionButton
} from '@/components/admin/accounts/AccountAdminDialog';

// Tab components
import { AccountSubmissionsTab } from '@/components/admin/accounts/tabs/AccountSubmissionsTab';
import { AccountPropertiesTab } from '@/components/admin/accounts/tabs/AccountPropertiesTab';
import { AccountOwnersTab } from '@/components/admin/accounts/tabs/AccountOwnersTab';
import { AccountAssignmentsTab } from '@/components/admin/accounts/tabs/AccountAssignmentsTab';
import { AccountPaymentsTab } from '@/components/admin/accounts/tabs/AccountPaymentsTab';

// Types
import { AccountData, OwnerData, PropertyData, AssignmentData, PaymentData } from '@/types/admin';

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

const AdminAccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [confirmAdminToggle, setConfirmAdminToggle] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    fetchAccountDetails();
  }, [id]);

  const fetchAccountDetails = async () => {
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

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
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
          properties:property_id (label),
          owners:owner_id (first_name, last_name)
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
        property_label: assignment.properties?.label || 'Unknown Property',
        owner_name: assignment.owners ? 
          `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
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

  const handleToggleAdmin = async () => {
    if (!account) return;
    
    try {
      if (account.is_admin) {
        // Remove admin privileges
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', account.id);
          
        if (error) throw error;
        
        setAccount({ ...account, is_admin: false });
        toast.success('Admin privileges removed');
      } else {
        // Grant admin privileges
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: account.id }]);
          
        if (error) throw error;
        
        setAccount({ ...account, is_admin: true });
        toast.success('Admin privileges granted');
      }
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    } finally {
      setConfirmAdminToggle(false);
    }
  };

  // Navigate back to accounts page
  const goBackToAccounts = () => navigate('/admin/accounts');

  if (loading) {
    return (
      <AdminLayout pageTitle="Account Details">
        <AccountDetailSkeleton onBack={goBackToAccounts} />
      </AdminLayout>
    );
  }

  if (!account) {
    return (
      <AdminLayout pageTitle="Account Not Found">
        <AccountNotFound onBack={goBackToAccounts} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Account: ${account.full_name || account.email}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={goBackToAccounts}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
          
          <AdminActionButton 
            isAdmin={account.is_admin}
            onClick={() => setConfirmAdminToggle(true)}
          />
          
          <AccountAdminDialog
            open={confirmAdminToggle}
            onOpenChange={setConfirmAdminToggle}
            onConfirm={handleToggleAdmin}
            accountName={account.full_name || account.email}
            isAdmin={account.is_admin}
          />
        </div>
        
        <AccountInfoCard 
          account={account}
          submissionsCount={submissions.length}
          propertiesCount={properties.length}
          ownersCount={owners.length}
          paymentsCount={payments.length}
        />
        
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions">
            <AccountSubmissionsTab submissions={submissions} />
          </TabsContent>
          
          <TabsContent value="properties">
            <AccountPropertiesTab properties={properties} />
          </TabsContent>
          
          <TabsContent value="owners">
            <AccountOwnersTab owners={owners} />
          </TabsContent>
          
          <TabsContent value="assignments">
            <AccountAssignmentsTab assignments={assignments} />
          </TabsContent>
          
          <TabsContent value="payments">
            <AccountPaymentsTab payments={payments} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAccountDetailPage;
