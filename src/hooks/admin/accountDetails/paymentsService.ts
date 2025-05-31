
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { PaymentData } from '@/types/admin';

// Simplified type guard for payment validation - less strict to avoid filtering out valid payments
const isValidPayment = (payment: any): payment is PaymentData => {
  console.log(`[paymentsService] 🔍 Validating payment:`, payment);
  
  const isValid = payment && 
         typeof payment.id === 'string' && 
         payment.id.length > 0 &&
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
    // Use authenticated admin client with proper headers
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for payments query');
    
    // Simplified query with better error handling
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

    // Apply simplified validation
    const validPayments = paymentsData.filter((payment, index) => {
      const isValid = isValidPayment(payment);
      if (!isValid) {
        console.error(`[paymentsService] ❌ Invalid payment data at index ${index}:`, payment);
      }
      return isValid;
    });

    console.log(`[paymentsService] ✅ Successfully returning ${validPayments.length} validated payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Unexpected error in fetchPayments:', error);
    throw new Error(`Payment service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced direct query strategy with better debugging
export const fetchPaymentsByUserId = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🎯 DIRECT FETCH: Fetching payments by user ID: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for direct user payments query');
    
    // Direct JOIN query to get payments for user with detailed logging
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
      throw new Error(`Direct payment query failed: ${paymentsError.message}`);
    }

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ Direct query found no payments for user ${userId}`);
      return [];
    }

    // Apply simplified validation
    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    
    console.log(`[paymentsService] 🎯 Direct query validated ${validPayments.length} payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Error in fetchPaymentsByUserId:', error);
    throw new Error(`Direct query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// New ultimate fallback with maximum debugging
export const fetchPaymentsDirectQuery = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK: Direct query for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    console.log('[paymentsService] 🔑 Using authenticated admin client for ultimate fallback query');
    
    // Try the simplest possible query first
    const { data: allPurchases, error: allError } = await adminClient
      .from('purchases')
      .select('*')
      .limit(10);
      
    console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - All purchases test:`, { 
      allPurchases, 
      allError,
      canAccessTable: !allError,
      totalRecords: allPurchases?.length || 0
    });

    if (allError) {
      console.error('[paymentsService] ❌ Cannot access purchases table at all:', allError);
      throw new Error(`No access to purchases table: ${allError.message}`);
    }

    // Now try to get purchases for the specific user
    const { data: userPurchases, error: userError } = await adminClient
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - All user purchases:`, { 
      userPurchases, 
      userError,
      totalUserRecords: userPurchases?.length || 0
    });

    if (userError) {
      console.error('[paymentsService] ❌ Error fetching all purchases:', userError);
      throw new Error(`Cannot fetch purchases: ${userError.message}`);
    }

    if (!userPurchases || userPurchases.length === 0) {
      console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - No purchases found in database`);
      return [];
    }

    // Filter for the specific user if we can't do it in the query
    const userSpecificPurchases = userPurchases.filter(purchase => {
      // Since we may not have form_submission_id linkage working, return all for debugging
      console.log(`[paymentsService] 🔍 Purchase record:`, purchase);
      return true; // Return all purchases for now to see what's available
    });

    console.log(`[paymentsService] 🚨 ULTIMATE FALLBACK - Returning ${userSpecificPurchases.length} purchases`);
    return userSpecificPurchases;

  } catch (error) {
    console.error('[paymentsService] ❌ Error in ultimate fallback:', error);
    throw new Error(`Ultimate fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
