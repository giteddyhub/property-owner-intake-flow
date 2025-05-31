
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
  console.log(`[dataFetchingService] 🚀 COMPREHENSIVE FETCH starting for user: ${userId}`);
  
  try {
    // Fetch user summary data
    console.log(`[dataFetchingService] 📋 Step 1: Fetching user summary...`);
    const userSummary = await fetchUserSummary(userId);
    console.log(`[dataFetchingService] ✅ User summary fetched:`, {
      email: userSummary.email,
      primarySubmissionId: userSummary.primary_submission_id,
      totalRevenue: userSummary.total_revenue
    });

    // Check admin status
    console.log(`[dataFetchingService] 👑 Step 2: Checking admin status...`);
    const isAdmin = await checkAdminStatus(userSummary.email);
    console.log(`[dataFetchingService] ✅ Admin status: ${isAdmin}`);

    // Fetch all parallel data
    console.log(`[dataFetchingService] 🔄 Step 3: Fetching parallel data...`);
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

    // Fetch payments with robust strategy approach
    console.log(`[dataFetchingService] 💳 Step 4: PAYMENTS - Starting comprehensive fetch...`);
    const payments = await fetchPaymentsWithStrategies(userId, fetchedSubmissions);

    const result = {
      userSummary,
      isAdmin,
      submissions: fetchedSubmissions,
      properties: propertiesData,
      owners: ownersData,
      assignments: enhancedAssignments,
      payments,
      activities: typedActivities
    };

    console.log(`[dataFetchingService] 🎉 COMPREHENSIVE FETCH COMPLETE:`, {
      userId,
      totalSubmissions: result.submissions.length,
      totalPayments: result.payments.length,
      totalProperties: result.properties.length,
      totalOwners: result.owners.length,
      totalAssignments: result.assignments.length,
      totalActivities: result.activities.length
    });

    return result;
  } catch (error) {
    console.error(`[dataFetchingService] ❌ COMPREHENSIVE FETCH FAILED:`, error);
    throw error;
  }
};

const fetchPaymentsWithStrategies = async (
  userId: string, 
  submissions: FormSubmission[]
): Promise<PaymentData[]> => {
  console.log(`[dataFetchingService] 💳🎯 PAYMENTS FETCH - Starting for user: ${userId}`);
  console.log(`[dataFetchingService] 📝 Available submissions:`, submissions.map(s => ({ 
    id: s.id, 
    state: s.state,
    isPrimary: s.is_primary_submission 
  })));
  
  let paymentsData: PaymentData[] = [];
  
  // Strategy 1: Use submission IDs if available
  const submissionIds = submissions.map(s => s.id).filter(Boolean);
  if (submissionIds.length > 0) {
    console.log(`[dataFetchingService] 🔑 PAYMENTS STRATEGY 1: Trying submission IDs:`, submissionIds);
    try {
      paymentsData = await fetchPayments(submissionIds);
      console.log(`[dataFetchingService] ✅ Strategy 1 result: ${paymentsData.length} payments`);
      
      if (paymentsData.length > 0) {
        console.log(`[dataFetchingService] 🎉 SUCCESS with Strategy 1! Found ${paymentsData.length} payments`);
        return paymentsData;
      }
    } catch (error) {
      console.error(`[dataFetchingService] ❌ Strategy 1 failed:`, error);
    }
  } else {
    console.log(`[dataFetchingService] ⚠️ No submission IDs available, skipping Strategy 1`);
  }

  // Strategy 2: Direct user query
  console.log(`[dataFetchingService] 🔄 PAYMENTS STRATEGY 2: Direct user query...`);
  try {
    paymentsData = await fetchPaymentsByUserId(userId);
    console.log(`[dataFetchingService] ✅ Strategy 2 result: ${paymentsData.length} payments`);
    
    if (paymentsData.length > 0) {
      console.log(`[dataFetchingService] 🎉 SUCCESS with Strategy 2! Found ${paymentsData.length} payments`);
      return paymentsData;
    }
  } catch (error) {
    console.error(`[dataFetchingService] ❌ Strategy 2 failed:`, error);
  }

  // Strategy 3: Emergency fallback
  console.log(`[dataFetchingService] 🚨 PAYMENTS STRATEGY 3: Emergency fallback...`);
  try {
    paymentsData = await fetchPaymentsDirectQuery(userId);
    console.log(`[dataFetchingService] ✅ Strategy 3 result: ${paymentsData.length} payments`);
    
    if (paymentsData.length > 0) {
      console.log(`[dataFetchingService] 🎉 SUCCESS with Strategy 3! Found ${paymentsData.length} payments`);
      return paymentsData;
    }
  } catch (error) {
    console.error(`[dataFetchingService] ❌ Strategy 3 failed:`, error);
  }

  // All strategies failed
  console.error(`[dataFetchingService] ❌ ALL PAYMENT STRATEGIES FAILED for user: ${userId}`);
  console.log(`[dataFetchingService] 📊 Final result: 0 payments found despite multiple strategies`);
  
  return [];
};
