
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { PaymentData } from '@/types/admin';

// More lenient validation - only check for essential fields
const isValidPayment = (payment: any): payment is PaymentData => {
  console.log(`[paymentsService] 🔍 Validating payment:`, payment);
  
  const isValid = payment && 
         payment.id && 
         typeof payment.id === 'string' &&
         payment.amount !== null && 
         payment.amount !== undefined;
         
  console.log(`[paymentsService] ✅ Payment validation result for ${payment?.id}:`, isValid);
  return isValid;
};

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🔍 Starting payment fetch for ${submissionIds.length} submission IDs:`, submissionIds);
  
  if (submissionIds.length === 0) {
    console.log(`[paymentsService] ⚠️ No submission IDs provided, returning empty array`);
    return [];
  }

  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for payments query');
    
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select('*')
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 📊 Raw database response:`, { paymentsData, paymentsError });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Error fetching payments:', paymentsError);
      throw new Error(`Payment fetch failed: ${paymentsError.message}`);
    }

    if (!paymentsData) {
      console.log(`[paymentsService] ⚠️ No payment data returned from database`);
      return [];
    }

    console.log(`[paymentsService] 📦 Received ${paymentsData.length} payments from database`);

    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] ✅ Successfully returning ${validPayments.length} validated payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Unexpected error in fetchPayments:', error);
    return []; // Return empty array instead of throwing to prevent cascade failures
  }
};

export const fetchPaymentsByUserId = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🎯 DIRECT FETCH: Fetching payments by user ID: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for direct user payments query');
    
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select(`
        *,
        form_submissions!inner (
          id,
          user_id,
          state
        )
      `)
      .eq('form_submissions.user_id', userId)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 🎯 DIRECT FETCH results:`, { 
      paymentsData, 
      paymentsError,
      userId,
      resultCount: paymentsData?.length || 0 
    });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Direct query error:', paymentsError);
      return [];
    }

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ Direct query found no payments for user ${userId}`);
      return [];
    }

    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] 🎯 Direct query validated ${validPayments.length} payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Error in fetchPaymentsByUserId:', error);
    return [];
  }
};

export const fetchPaymentsDirectQuery = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK: Direct query for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for ultimate fallback query');
    
    // Get all purchases and then filter by user submissions
    const { data: userSubmissions, error: submissionsError } = await adminClient
      .from('form_submissions')
      .select('id')
      .eq('user_id', userId);

    if (submissionsError) {
      console.error('[paymentsService] ❌ Error fetching user submissions:', submissionsError);
      return [];
    }

    if (!userSubmissions || userSubmissions.length === 0) {
      console.log(`[paymentsService] ⚠️ No submissions found for user ${userId}`);
      return [];
    }

    const submissionIds = userSubmissions.map(s => s.id);
    console.log(`[paymentsService] 📋 Found ${submissionIds.length} submissions for user:`, submissionIds);

    const { data: userPurchases, error: purchasesError } = await adminClient
      .from('purchases')
      .select('*')
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - User purchases:`, { 
      userPurchases, 
      purchasesError,
      totalUserRecords: userPurchases?.length || 0
    });

    if (purchasesError) {
      console.error('[paymentsService] ❌ Error fetching purchases:', purchasesError);
      return [];
    }

    if (!userPurchases || userPurchases.length === 0) {
      console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - No purchases found for user`);
      return [];
    }

    const validPayments = userPurchases.filter(payment => isValidPayment(payment));
    console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - Returning ${validPayments.length} validated purchases`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Error in ultimate fallback:', error);
    return [];
  }
};
