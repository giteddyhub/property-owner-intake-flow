
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';
import { FormSubmission } from '../types';
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
} from '../accountDetailsService';
import { fetchPaymentsDirectQuery } from '../paymentsService';

// Enhanced type guard for payment validation
const isValidPaymentData = (payment: any): payment is PaymentData => {
  return payment && 
         typeof payment.id === 'string' && 
         payment.id.length > 0 &&
         payment.amount !== null && 
         payment.amount !== undefined &&
         !isNaN(Number(payment.amount));
};

export interface FetchedData {
  userSummary: any;
  isAdmin: boolean;
  submissions: FormSubmission[];
  properties: PropertyData[];
  owners: OwnerData[];
  assignments: AssignmentData[];
  payments: PaymentData[];
  activities: UserActivityData[];
}

export const fetchAccountData = async (userId: string): Promise<FetchedData> => {
  console.log(`[dataFetchingService] 🚀 Starting comprehensive fetch for user ID: ${userId}`);
  
  // Fetch user summary data
  console.log(`[dataFetchingService] 📋 Fetching user summary...`);
  const userSummary = await fetchUserSummary(userId);
  console.log(`[dataFetchingService] ✅ User summary fetched:`, {
    email: userSummary.email,
    primarySubmissionId: userSummary.primary_submission_id,
    totalRevenue: userSummary.total_revenue
  });

  // Check admin status
  const isAdmin = await checkAdminStatus(userSummary.email);

  // Fetch all parallel data
  console.log(`[dataFetchingService] 🔄 Fetching parallel data...`);
  const [
    fetchedSubmissions,
    propertiesData,
    ownersData,
    enhancedAssignments,
    typedActivities
  ] = await Promise.all([
    fetchSubmissions(userId, userSummary.primary_submission_id),
    fetchProperties(userId),
    fetchOwners(userId),
    fetchAssignments(userId),
    fetchActivities(userId)
  ]);

  console.log(`[dataFetchingService] ✅ Parallel data fetched:`, {
    submissions: fetchedSubmissions.length,
    properties: propertiesData.length,
    owners: ownersData.length,
    assignments: enhancedAssignments.length,
    activities: typedActivities.length
  });

  // Fetch payments with multiple strategies
  const payments = await fetchPaymentsWithStrategies(userId, fetchedSubmissions);

  return {
    userSummary,
    isAdmin,
    submissions: fetchedSubmissions,
    properties: propertiesData,
    owners: ownersData,
    assignments: enhancedAssignments,
    payments,
    activities: typedActivities
  };
};

const fetchPaymentsWithStrategies = async (
  userId: string, 
  submissions: FormSubmission[]
): Promise<PaymentData[]> => {
  let paymentsData: PaymentData[] = [];
  let paymentsFetchSuccess = false;
  
  // Strategy 1: Extract submission IDs and fetch payments
  const submissionIds = submissions.map(s => s.id);
  console.log(`[dataFetchingService] 🔑 Strategy 1: Extracted ${submissionIds.length} submission IDs for payment fetch`);
  
  // Log submission details for debugging
  submissions.forEach((submission, index) => {
    console.log(`[dataFetchingService]   ${index + 1}. ${submission.id} (state: ${submission.state}, created: ${submission.created_at})`);
  });

  if (submissionIds.length > 0) {
    try {
      console.log(`[dataFetchingService] 💳 Strategy 1: Fetching payments for all submissions...`);
      paymentsData = await fetchPayments(submissionIds);
      
      // Validate payments with type guards
      const validatedPayments = paymentsData.filter(payment => {
        const isValid = isValidPaymentData(payment);
        if (!isValid) {
          console.error(`[dataFetchingService] ❌ Invalid payment detected in Strategy 1:`, payment);
        }
        return isValid;
      });
      
      paymentsData = validatedPayments;
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 1 completed:`, {
        totalPayments: paymentsData.length,
        paymentDetails: paymentsData.map(p => ({ 
          id: p.id, 
          amount: p.amount, 
          status: p.payment_status,
          submissionId: p.form_submission_id 
        }))
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 1 failed:`, error);
      paymentsFetchSuccess = false;
      paymentsData = [];
    }
  }

  // Strategy 2: Fallback - Fetch payments directly by user ID if Strategy 1 failed or returned no results
  if (!paymentsFetchSuccess) {
    try {
      console.log(`[dataFetchingService] 🔄 Strategy 2: Fetching payments directly by user ID...`);
      paymentsData = await fetchPaymentsByUserId(userId);
      
      // Validate payments again
      const validatedPayments = paymentsData.filter(payment => {
        const isValid = isValidPaymentData(payment);
        if (!isValid) {
          console.error(`[dataFetchingService] ❌ Invalid payment detected in Strategy 2:`, payment);
        }
        return isValid;
      });
      
      paymentsData = validatedPayments;
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 2 completed:`, {
        totalPayments: paymentsData.length,
        paymentDetails: paymentsData.map(p => ({ 
          id: p.id, 
          amount: p.amount, 
          status: p.payment_status 
        }))
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 2 failed:`, error);
      paymentsFetchSuccess = false;
      paymentsData = [];
    }
  }

  // Strategy 3: Ultimate fallback - Direct database query
  if (!paymentsFetchSuccess) {
    try {
      console.log(`[dataFetchingService] 🎯 Strategy 3: Direct query as ultimate fallback...`);
      paymentsData = await fetchPaymentsDirectQuery(userId);
      
      // Final validation
      const validatedPayments = paymentsData.filter(payment => {
        const isValid = isValidPaymentData(payment);
        if (!isValid) {
          console.error(`[dataFetchingService] ❌ Invalid payment detected in Strategy 3:`, payment);
        }
        return isValid;
      });
      
      paymentsData = validatedPayments;
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 3 completed:`, {
        totalPayments: paymentsData.length,
        paymentDetails: paymentsData.map(p => ({ 
          id: p.id, 
          amount: p.amount, 
          status: p.payment_status 
        }))
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 3 failed:`, error);
      paymentsFetchSuccess = false;
      paymentsData = [];
    }
  }

  // Final validation and reporting
  if (!paymentsFetchSuccess || paymentsData.length === 0) {
    console.log(`[dataFetchingService] ⚠️ No payments found after all strategies - this is normal if user has no payments`);
  } else {
    console.log(`[dataFetchingService] 🎉 SUCCESS: Payments retrieved successfully using one of the strategies`);
  }

  return paymentsData;
};
