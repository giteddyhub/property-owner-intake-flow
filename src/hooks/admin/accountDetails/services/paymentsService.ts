
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { PaymentData } from '@/types/admin';

// Simplified validation - only check essential fields
const isValidPayment = (payment: any): payment is PaymentData => {
  console.log(`[paymentsService] 🔍 Validating payment:`, payment);
  
  const isValid = payment && 
         payment.id && 
         typeof payment.id === 'string' &&
         payment.amount !== null && 
         payment.amount !== undefined;
         
  console.log(`[paymentsService] ${isValid ? '✅' : '❌'} Payment validation result for ${payment?.id}:`, isValid);
  return isValid;
};

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🎯 STRATEGY 1: Fetching payments for ${submissionIds.length} submission IDs:`, submissionIds);
  
  if (submissionIds.length === 0) {
    console.log(`[paymentsService] ⚠️ No submission IDs provided, returning empty array`);
    return [];
  }

  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for payments query');
    
    // Direct query to purchases table filtering by submission IDs
    console.log('[paymentsService] 📡 Executing database query...');
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select('*')
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 📊 Database query completed:`, { 
      success: !paymentsError,
      resultCount: paymentsData?.length || 0,
      error: paymentsError?.message 
    });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Database error fetching payments:', paymentsError);
      throw new Error(`Payment fetch failed: ${paymentsError.message}`);
    }

    if (!paymentsData) {
      console.log(`[paymentsService] ⚠️ No payment data returned from database`);
      return [];
    }

    console.log(`[paymentsService] 📦 Received ${paymentsData.length} payments from database`);

    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] ✅ STRATEGY 1 SUCCESS: Returning ${validPayments.length} validated payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Strategy 1 failed with error:', error);
    throw error; // Re-throw to let caller handle
  }
};

export const fetchPaymentsByUserId = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🎯 STRATEGY 2: Direct fetch by user ID: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for direct user payments query');
    
    // First get all form submissions for this user
    console.log('[paymentsService] 📡 Step 1: Getting user submissions...');
    const { data: userSubmissions, error: submissionsError } = await adminClient
      .from('form_submissions')
      .select('id')
      .eq('user_id', userId);

    console.log(`[paymentsService] 📋 User submissions result:`, { 
      success: !submissionsError,
      submissionCount: userSubmissions?.length || 0,
      error: submissionsError?.message 
    });

    if (submissionsError) {
      console.error('[paymentsService] ❌ Error fetching user submissions:', submissionsError);
      return [];
    }

    if (!userSubmissions || userSubmissions.length === 0) {
      console.log(`[paymentsService] ⚠️ No submissions found for user ${userId}`);
      return [];
    }

    const submissionIds = userSubmissions.map(s => s.id);
    console.log(`[paymentsService] 📋 Found ${submissionIds.length} submissions for user`);

    // Now get payments for these submissions
    console.log('[paymentsService] 📡 Step 2: Getting payments for submissions...');
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select('*')
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 💳 Payments query result:`, { 
      success: !paymentsError,
      resultCount: paymentsData?.length || 0,
      error: paymentsError?.message 
    });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Error fetching payments:', paymentsError);
      return [];
    }

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ No payments found for user submissions`);
      return [];
    }

    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] ✅ STRATEGY 2 SUCCESS: Returning ${validPayments.length} validated payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Strategy 2 failed with error:', error);
    throw error; // Re-throw to let caller handle
  }
};

export const fetchPaymentsDirectQuery = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🚨 STRATEGY 3: Emergency fallback for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for emergency query');
    
    // Get purchases with form submission data in a single query
    console.log('[paymentsService] 📡 Getting purchases with form submissions...');
    const { data: allPurchases, error: purchasesError } = await adminClient
      .from('purchases')
      .select(`
        *,
        form_submissions!inner (
          user_id
        )
      `)
      .eq('form_submissions.user_id', userId)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 🚨 Emergency query result:`, { 
      success: !purchasesError,
      resultCount: allPurchases?.length || 0,
      error: purchasesError?.message
    });

    if (purchasesError) {
      console.error('[paymentsService] ❌ Emergency query failed:', purchasesError);
      return [];
    }

    if (!allPurchases || allPurchases.length === 0) {
      console.log(`[paymentsService] 🚨 Emergency query found no payments`);
      return [];
    }

    const validPayments = allPurchases.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] ✅ STRATEGY 3 SUCCESS: Emergency fallback returning ${validPayments.length} payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Strategy 3 (emergency) failed:', error);
    return []; // Don't throw, this is the final fallback
  }
};
