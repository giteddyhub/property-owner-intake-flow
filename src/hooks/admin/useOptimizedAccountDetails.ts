
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';
import { AccountDetails, FormSubmission } from './accountDetails/types';
import { useSessionValidation } from './accountDetails/useSessionValidation';
import {
  fetchUserSummary,
  checkAdminStatus,
  fetchSubmissions,
  fetchProperties,
  fetchOwners,
  fetchAssignments,
  fetchActivities,
  fetchPayments
} from './accountDetails/accountDetailsService';

export const useOptimizedAccountDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { validateSession, adminSession } = useSessionValidation();
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
      console.log(`[useOptimizedAccountDetails] Starting fetch for user ID: ${id}`);
      
      // Validate admin session
      const isSessionValid = await validateSession();
      if (!isSessionValid) return;

      // Fetch user summary data
      console.log(`[useOptimizedAccountDetails] Fetching user summary...`);
      const userSummary = await fetchUserSummary(id);
      console.log(`[useOptimizedAccountDetails] User summary:`, userSummary);

      // Check admin status
      const isAdmin = await checkAdminStatus(userSummary.email);
      console.log(`[useOptimizedAccountDetails] Admin status for ${userSummary.email}:`, isAdmin);

      // Fetch all data in parallel using optimized queries
      console.log(`[useOptimizedAccountDetails] Fetching parallel data...`);
      const [
        enhancedSubmissions,
        propertiesData,
        ownersData,
        enhancedAssignments,
        typedActivities
      ] = await Promise.all([
        fetchSubmissions(id, userSummary.primary_submission_id),
        fetchProperties(id),
        fetchOwners(id),
        fetchAssignments(id),
        fetchActivities(id)
      ]);

      console.log(`[useOptimizedAccountDetails] Submissions fetched:`, enhancedSubmissions);
      console.log(`[useOptimizedAccountDetails] Properties fetched:`, propertiesData.length);
      console.log(`[useOptimizedAccountDetails] Owners fetched:`, ownersData.length);
      console.log(`[useOptimizedAccountDetails] Assignments fetched:`, enhancedAssignments.length);
      console.log(`[useOptimizedAccountDetails] Activities fetched:`, typedActivities.length);

      // Fetch payments based on submissions
      const submissionIds = enhancedSubmissions.map(s => s.id);
      console.log(`[useOptimizedAccountDetails] Submission IDs for payment fetch:`, submissionIds);
      
      const paymentsData = await fetchPayments(submissionIds);
      console.log(`[useOptimizedAccountDetails] Payments fetched:`, paymentsData);
      console.log(`[useOptimizedAccountDetails] Payment details:`, paymentsData.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.payment_status,
        submission_id: p.form_submission_id
      })));

      // Set all state
      const accountData = {
        ...userSummary,
        updated_at: userSummary.created_at, // View doesn't track updated_at
        is_admin: isAdmin,
        total_revenue: Number(userSummary.total_revenue || 0),
        recent_activities: userSummary.recent_activities || 0,
        // Map the counts for compatibility with AccountData
        submissions_count: enhancedSubmissions.length,
        properties_count: propertiesData.length,
        owners_count: ownersData.length
      };

      console.log(`[useOptimizedAccountDetails] Setting account data:`, accountData);
      console.log(`[useOptimizedAccountDetails] Setting payments data:`, paymentsData);

      setAccount(accountData);
      setSubmissions(enhancedSubmissions);
      setProperties(propertiesData);
      setOwners(ownersData);
      setAssignments(enhancedAssignments);
      setPayments(paymentsData);
      setActivities(typedActivities);

      console.log('Optimized account details loaded:', {
        profile: userSummary.email,
        submissions: enhancedSubmissions.length,
        properties: propertiesData.length,
        owners: ownersData.length,
        assignments: enhancedAssignments.length,
        payments: paymentsData.length,
        activities: typedActivities.length,
        dataSource: 'admin_user_summary_view'
      });

    } catch (error: any) {
      console.error('[useOptimizedAccountDetails] Error fetching optimized account details:', error);
      
      if (error.message === 'Account not found') {
        toast.error('Account not found');
        navigate('/admin/accounts');
      } else {
        toast.error('Failed to load account details', {
          description: error.message
        });
      }
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
