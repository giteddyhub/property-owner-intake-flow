
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AccountDetails } from './types';
import { useSessionValidation } from './useSessionValidation';
import { fetchAccountData } from './services/dataFetchingService';
import { calculateAccountMetrics } from './utils/metricsCalculator';
import { OptimizedAccountData } from './types/optimizedAccountTypes';

export const useOptimizedAccountDetails = (id: string | undefined): OptimizedAccountData => {
  const navigate = useNavigate();
  const { validateSession, adminSession } = useSessionValidation();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchOptimizedAccountDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Validate admin session
      const isSessionValid = await validateSession();
      if (!isSessionValid) return;

      // Check if admin token is available
      const adminToken = localStorage.getItem('admin_session');
      if (!adminToken) {
        console.error('[useOptimizedAccountDetails] ❌ No admin token available');
        toast.error('Admin authentication required');
        navigate('/admin/login');
        return;
      }

      // Fetch all account data
      const fetchedData = await fetchAccountData(id);

      // Calculate metrics
      const metrics = calculateAccountMetrics(
        fetchedData.submissions,
        fetchedData.payments,
        fetchedData.properties.length,
        fetchedData.owners.length,
        fetchedData.activities.length
      );

      // Prepare account data
      const accountData = {
        ...fetchedData.userSummary,
        updated_at: fetchedData.userSummary.created_at,
        is_admin: fetchedData.isAdmin,
        total_revenue: metrics.totalPaymentAmount,
        recent_activities: fetchedData.userSummary.recent_activities || 0,
        properties_count: metrics.propertiesCount,
        owners_count: metrics.ownersCount,
        submissions_count: metrics.submissionsCount
      };

      // Set all state with comprehensive logging and validation
      console.log(`[useOptimizedAccountDetails] 🎯 Setting final state:`, {
        account: accountData.email,
        submissions: fetchedData.submissions.length,
        payments: fetchedData.payments.length,
        properties: fetchedData.properties.length,
        owners: fetchedData.owners.length,
        assignments: fetchedData.assignments.length,
        activities: fetchedData.activities.length,
        calculatedRevenue: metrics.totalPaymentAmount
      });

      // Validate payments one more time before setting state
      if (!Array.isArray(fetchedData.payments)) {
        console.error(`[useOptimizedAccountDetails] ❌ CRITICAL: paymentsData is not an array:`, fetchedData.payments);
        setPayments([]);
      } else {
        setPayments(fetchedData.payments);
      }

      setAccount(accountData);
      setSubmissions(fetchedData.submissions);
      setProperties(fetchedData.properties);
      setOwners(fetchedData.owners);
      setAssignments(fetchedData.assignments);
      setActivities(fetchedData.activities);

      console.log(`[useOptimizedAccountDetails] ✅ State update completed successfully!`);
      console.log(`[useOptimizedAccountDetails] 🔍 Final verification - payments in state:`, fetchedData.payments.length);

    } catch (error: any) {
      console.error('[useOptimizedAccountDetails] ❌ Error fetching account details:', error);
      
      // Check for authentication-related errors
      if (error.message?.includes('admin token') || error.message?.includes('authentication')) {
        toast.error('Admin authentication expired', {
          description: 'Please log in again to access admin features'
        });
        navigate('/admin/login');
      } else if (error.message === 'Account not found') {
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
