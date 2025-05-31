
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
  fetchPayments,
  fetchPaymentsByUserId
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

      // Enhanced payment fetching with validation
      let paymentsData: PaymentData[] = [];
      
      // Strategy 1: Extract submission IDs and fetch payments
      const submissionIds = fetchedSubmissions.map(s => s.id);
      console.log(`[useOptimizedAccountDetails] 🔑 Strategy 1: Extracted ${submissionIds.length} submission IDs for payment fetch`);
      
      // Log submission details for debugging
      fetchedSubmissions.forEach((submission, index) => {
        console.log(`[useOptimizedAccountDetails]   ${index + 1}. ${submission.id} (state: ${submission.state}, created: ${submission.created_at})`);
      });

      if (submissionIds.length > 0) {
        try {
          console.log(`[useOptimizedAccountDetails] 💳 Strategy 1: Fetching payments for all submissions...`);
          paymentsData = await fetchPayments(submissionIds);
          console.log(`[useOptimizedAccountDetails] ✅ Strategy 1 completed:`, {
            totalPayments: paymentsData.length,
            paymentDetails: paymentsData.map(p => ({ 
              id: p.id, 
              amount: p.amount, 
              status: p.payment_status,
              submissionId: p.form_submission_id 
            }))
          });
        } catch (error) {
          console.error(`[useOptimizedAccountDetails] ❌ Strategy 1 failed:`, error);
          paymentsData = [];
        }
      }

      // Strategy 2: Fallback - Fetch payments directly by user ID if Strategy 1 failed or returned no results
      if (paymentsData.length === 0) {
        try {
          console.log(`[useOptimizedAccountDetails] 🔄 Strategy 2: Fetching payments directly by user ID...`);
          paymentsData = await fetchPaymentsByUserId(id);
          console.log(`[useOptimizedAccountDetails] ✅ Strategy 2 completed:`, {
            totalPayments: paymentsData.length,
            paymentDetails: paymentsData.map(p => ({ 
              id: p.id, 
              amount: p.amount, 
              status: p.payment_status 
            }))
          });
        } catch (error) {
          console.error(`[useOptimizedAccountDetails] ❌ Strategy 2 failed:`, error);
          paymentsData = [];
        }
      }

      // Final validation and error reporting
      if (paymentsData.length === 0) {
        console.warn(`[useOptimizedAccountDetails] ⚠️ No payments found using any strategy for user ${id}`);
        console.warn(`[useOptimizedAccountDetails] 🔍 Debug info:`, {
          userId: id,
          userEmail: userSummary.email,
          submissionsFound: fetchedSubmissions.length,
          submissionIds: submissionIds,
          submissionStates: fetchedSubmissions.map(s => s.state),
          strategiesAttempted: 2
        });
      }

      // Calculate metrics with enhanced validation
      const hasCompletedSetup = fetchedSubmissions.some(s => s.is_primary_submission && s.state === 'completed');
      const totalPaymentAmount = paymentsData.reduce((sum, p) => {
        const amount = Number(p.amount || 0);
        const validAmount = isNaN(amount) ? 0 : amount;
        if (amount !== validAmount) {
          console.warn(`[useOptimizedAccountDetails] ⚠️ Invalid payment amount detected:`, {
            paymentId: p.id,
            originalAmount: p.amount,
            convertedAmount: validAmount
          });
        }
        return sum + validAmount;
      }, 0);

      console.log(`[useOptimizedAccountDetails] 📊 Final calculations:`, {
        hasCompletedSetup,
        totalPaymentAmount,
        paymentsCount: paymentsData.length,
        submissionsProcessed: fetchedSubmissions.length,
        paymentsBySubmission: paymentsData.reduce((acc, p) => {
          acc[p.form_submission_id] = (acc[p.form_submission_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      // Prepare account data
      const accountData = {
        ...userSummary,
        updated_at: userSummary.created_at,
        is_admin: isAdmin,
        total_revenue: totalPaymentAmount,
        recent_activities: userSummary.recent_activities || 0,
        properties_count: propertiesData.length,
        owners_count: ownersData.length
      };

      // Set all state with comprehensive logging
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
      console.log(`[useOptimizedAccountDetails] 🔍 Final verification - payments in state:`, paymentsData.length);

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
