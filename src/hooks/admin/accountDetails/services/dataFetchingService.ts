
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';
import { FormSubmission } from '../types';
import {
  fetchUserSummary,
  checkAdminStatus,
  fetchSubmissions,
  fetchProperties,
  fetchOwners,
  fetchAssignments,
  fetchActivities
} from '../accountDetailsService';
import { fetchPayments, fetchPaymentsByUserId, fetchPaymentsDirectQuery } from '../paymentsService';

// Enhanced type guard for payment validation
const isValidPaymentData = (payment: any): payment is PaymentData => {
  console.log(`[dataFetchingService] 🔍 Final payment validation:`, payment);
  const isValid = payment && 
         typeof payment.id === 'string' && 
         payment.id.length > 0 &&
         payment.amount !== null && 
         payment.amount !== undefined;
  console.log(`[dataFetchingService] ✅ Payment validation result:`, isValid);
  return isValid;
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

  // Fetch payments with enhanced debugging and multiple strategies
  const payments = await fetchPaymentsWithEnhancedDebugging(userId, fetchedSubmissions);

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

const fetchPaymentsWithEnhancedDebugging = async (
  userId: string, 
  submissions: FormSubmission[]
): Promise<PaymentData[]> => {
  console.log(`[dataFetchingService] 💳 ENHANCED PAYMENT DEBUGGING for user: ${userId}`);
  
  let paymentsData: PaymentData[] = [];
  let paymentsFetchSuccess = false;
  
  // Strategy 1: Use submission IDs
  const submissionIds = submissions.map(s => s.id);
  console.log(`[dataFetchingService] 🔑 Strategy 1: Using ${submissionIds.length} submission IDs:`, submissionIds);
  
  if (submissionIds.length > 0) {
    try {
      console.log(`[dataFetchingService] 💳 Strategy 1: Fetching payments by submission IDs...`);
      paymentsData = await fetchPayments(submissionIds);
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 1 result:`, {
        success: paymentsFetchSuccess,
        paymentsCount: paymentsData.length,
        payments: paymentsData.map(p => ({ id: p.id, amount: p.amount, status: p.payment_status }))
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 1 failed:`, error);
    }
  }

  // Strategy 2: Direct user query
  if (!paymentsFetchSuccess) {
    try {
      console.log(`[dataFetchingService] 🔄 Strategy 2: Direct user query...`);
      paymentsData = await fetchPaymentsByUserId(userId);
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 2 result:`, {
        success: paymentsFetchSuccess,
        paymentsCount: paymentsData.length
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 2 failed:`, error);
    }
  }

  // Strategy 3: Ultimate fallback
  if (!paymentsFetchSuccess) {
    try {
      console.log(`[dataFetchingService] 🚨 Strategy 3: Ultimate fallback...`);
      paymentsData = await fetchPaymentsDirectQuery(userId);
      paymentsFetchSuccess = paymentsData.length > 0;
      
      console.log(`[dataFetchingService] ✅ Strategy 3 result:`, {
        success: paymentsFetchSuccess,
        paymentsCount: paymentsData.length
      });
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 3 failed:`, error);
    }
  }

  // Final validation and reporting
  const finalValidatedPayments = paymentsData.filter(payment => isValidPaymentData(payment));
  
  console.log(`[dataFetchingService] 🎯 FINAL PAYMENT SUMMARY:`, {
    originalCount: paymentsData.length,
    validatedCount: finalValidatedPayments.length,
    userId,
    success: finalValidatedPayments.length > 0,
    samplePayment: finalValidatedPayments.length > 0 ? finalValidatedPayments[0] : 'none'
  });

  return finalValidatedPayments;
};
