
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
import { fetchPayments, fetchPaymentsByUserId, fetchPaymentsDirectQuery } from './paymentsService';

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

  // Fetch payments with all strategies
  const payments = await fetchPaymentsComprehensively(userId, fetchedSubmissions);

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

const fetchPaymentsComprehensively = async (
  userId: string, 
  submissions: FormSubmission[]
): Promise<PaymentData[]> => {
  console.log(`[dataFetchingService] 💳 COMPREHENSIVE PAYMENT FETCH for user: ${userId}`);
  console.log(`[dataFetchingService] 📝 Available submissions:`, submissions.map(s => ({ id: s.id, state: s.state })));
  
  let paymentsData: PaymentData[] = [];
  
  // Strategy 1: Use submission IDs if available
  const submissionIds = submissions.map(s => s.id).filter(Boolean);
  if (submissionIds.length > 0) {
    console.log(`[dataFetchingService] 🔑 Strategy 1: Fetching by submission IDs:`, submissionIds);
    try {
      paymentsData = await fetchPayments(submissionIds);
      console.log(`[dataFetchingService] ✅ Strategy 1 result: ${paymentsData.length} payments`);
      
      if (paymentsData.length > 0) {
        console.log(`[dataFetchingService] 🎯 SUCCESS with Strategy 1!`);
        return paymentsData;
      }
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 1 failed:`, error);
    }
  }

  // Strategy 2: Direct user query
  console.log(`[dataFetchingService] 🔄 Strategy 2: Direct user query...`);
  try {
    paymentsData = await fetchPaymentsByUserId(userId);
    console.log(`[dataFetchingService] ✅ Strategy 2 result: ${paymentsData.length} payments`);
    
    if (paymentsData.length > 0) {
      console.log(`[dataFetchingService] 🎯 SUCCESS with Strategy 2!`);
      return paymentsData;
    }
  } catch (error) {
    console.error(`[dataFetchingService] ❌ Strategy 2 failed:`, error);
  }

  // Strategy 3: Ultimate fallback
  console.log(`[dataFetchingService] 🚨 Strategy 3: Ultimate fallback...`);
  try {
    paymentsData = await fetchPaymentsDirectQuery(userId);
    console.log(`[dataFetchingService] ✅ Strategy 3 result: ${paymentsData.length} payments`);
    
    if (paymentsData.length > 0) {
      console.log(`[dataFetchingService] 🎯 SUCCESS with Strategy 3!`);
      return paymentsData;
    }
  } catch (error) {
    console.error(`[dataFetchingService] ❌ Strategy 3 failed:`, error);
  }

  // All strategies failed
  console.error(`[dataFetchingService] ❌ ALL PAYMENT FETCH STRATEGIES FAILED for user: ${userId}`);
  console.log(`[dataFetchingService] 📊 Final summary: 0 payments found despite trying all methods`);
  
  return [];
};
