
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
      console.log(`[useOptimizedAccountDetails] 🚀 Starting comprehensive fetch for user ID: ${id}`);
      
      // Validate admin session
      const isSessionValid = await validateSession();
      if (!isSessionValid) return;

      // Fetch user summary data
      console.log(`[useOptimizedAccountDetails] 📋 Fetching user summary...`);
      const userSummary = await fetchUserSummary(id);
      console.log(`[useOptimizedAccountDetails] ✅ User summary fetched:`, {
        email: userSummary.email,
        primarySubmissionId: userSummary.primary_submission_id,
        totalRevenue: userSummary.total_revenue
      });

      // Check admin status
      const isAdmin = await checkAdminStatus(userSummary.email);

      // Fetch all parallel data
      console.log(`[useOptimizedAccountDetails] 🔄 Fetching parallel data...`);
      const [
        fetchedSubmissions,
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

      console.log(`[useOptimizedAccountDetails] ✅ Parallel data fetched:`, {
        submissions: fetchedSubmissions.length,
        properties: propertiesData.length,
        owners: ownersData.length,
        assignments: enhancedAssignments.length,
        activities: typedActivities.length
      });

      // Extract ALL submission IDs for payment fetch
      const submissionIds = fetchedSubmissions.map(s => s.id);
      console.log(`[useOptimizedAccountDetails] 🔑 Extracted ${submissionIds.length} submission IDs for payment fetch:`);
      submissionIds.forEach((id, index) => {
        const submission = fetchedSubmissions.find(s => s.id === id);
        console.log(`[useOptimizedAccountDetails]   ${index + 1}. ${id} (state: ${submission?.state})`);
      });

      // Fetch payments for ALL submissions
      let paymentsData: PaymentData[] = [];
      if (submissionIds.length > 0) {
        console.log(`[useOptimizedAccountDetails] 💳 Fetching payments for all submissions...`);
        paymentsData = await fetchPayments(submissionIds);
        console.log(`[useOptimizedAccountDetails] ✅ Payments fetch completed:`, {
          totalPayments: paymentsData.length,
          paymentIds: paymentsData.map(p => p.id),
          amounts: paymentsData.map(p => ({ id: p.id, amount: p.amount, status: p.payment_status }))
        });
      } else {
        console.log(`[useOptimizedAccountDetails] ⚠️ No submissions found, skipping payment fetch`);
      }

      // Calculate metrics
      const hasCompletedSetup = fetchedSubmissions.some(s => s.is_primary_submission && s.state === 'completed');
      const totalPaymentAmount = paymentsData.reduce((sum, p) => {
        const amount = Number(p.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      console.log(`[useOptimizedAccountDetails] 📊 Final calculations:`, {
        hasCompletedSetup,
        totalPaymentAmount,
        paymentsBreakdown: paymentsData.map(p => ({
          id: p.id,
          amount: p.amount,
          numericAmount: Number(p.amount || 0),
          status: p.payment_status
        }))
      });

      // Prepare account data
      const accountData = {
        ...userSummary,
        updated_at: userSummary.created_at,
        is_admin: isAdmin,
        total_revenue: totalPaymentAmount, // Use calculated amount instead of summary
        recent_activities: userSummary.recent_activities || 0,
        submissions_count: fetchedSubmissions.length,
        properties_count: propertiesData.length,
        owners_count: ownersData.length
      };

      // Set all state
      console.log(`[useOptimizedAccountDetails] 🎯 Setting final state:`, {
        account: accountData.email,
        submissions: fetchedSubmissions.length,
        payments: paymentsData.length,
        properties: propertiesData.length,
        owners: ownersData.length,
        assignments: enhancedAssignments.length,
        activities: typedActivities.length,
        calculatedRevenue: totalPaymentAmount
      });

      setAccount(accountData);
      setSubmissions(fetchedSubmissions);
      setProperties(propertiesData);
      setOwners(ownersData);
      setAssignments(enhancedAssignments);
      setPayments(paymentsData);
      setActivities(typedActivities);

      console.log(`[useOptimizedAccountDetails] ✅ State update completed successfully!`);

    } catch (error: any) {
      console.error('[useOptimizedAccountDetails] ❌ Error fetching account details:', error);
      
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
