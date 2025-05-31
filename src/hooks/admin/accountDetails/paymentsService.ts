
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { PaymentData } from '@/types/admin';

// Enhanced type guard for payment validation
const isValidPayment = (payment: any): payment is PaymentData => {
  return payment && 
         typeof payment.id === 'string' && 
         payment.id.length > 0 &&
         typeof payment.form_submission_id === 'string' &&
         typeof payment.payment_status === 'string' &&
         payment.amount !== null && 
         payment.amount !== undefined;
};

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🔍 Starting payment fetch for ${submissionIds.length} submission IDs:`);
  submissionIds.forEach((id, index) => {
    console.log(`[paymentsService]   ${index + 1}. ${id}`);
  });
  
  if (submissionIds.length === 0) {
    console.log(`[paymentsService] ⚠️ No submission IDs provided, returning empty array`);
    return [];
  }

  try {
    // Use authenticated admin client with proper headers
    const adminClient = getAuthenticatedAdminClient();
    
    // Enhanced query with better error handling
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select(`
        id,
        form_submission_id,
        amount,
        currency,
        payment_status,
        has_document_retrieval,
        stripe_session_id,
        stripe_payment_id,
        created_at,
        updated_at,
        form_submissions:form_submission_id (
          id,
          state,
          user_id
        )
      `)
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Error fetching payments:', paymentsError);
      throw new Error(`Payment fetch failed: ${paymentsError.message}`);
    }

    console.log(`[paymentsService] ✅ Raw payment query result:`, paymentsData);

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ No payments found for submission IDs:`, submissionIds);
      return [];
    }

    // Validate and clean the payment data with enhanced validation
    const validPayments = paymentsData.filter((payment, index) => {
      const isValid = isValidPayment(payment);
      if (!isValid) {
        console.error(`[paymentsService] ❌ Invalid payment data at index ${index}:`, payment);
      }
      return isValid;
    });

    // Enhanced logging with data validation
    console.log(`[paymentsService] 💰 Found ${validPayments.length} valid payments out of ${paymentsData.length} total:`);
    validPayments.forEach((payment, index) => {
      console.log(`[paymentsService]   Payment ${index + 1}:`, {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.payment_status,
        submissionId: payment.form_submission_id,
        createdAt: payment.created_at,
        isValidAmount: !isNaN(Number(payment.amount))
      });
    });

    console.log(`[paymentsService] ✅ Successfully returning ${validPayments.length} validated payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Unexpected error in fetchPayments:', error);
    throw new Error(`Payment service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced fallback function with comprehensive error handling
export const fetchPaymentsByUserId = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🔄 Fetching payments directly by user ID: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    // Get all submissions for this user first
    const { data: userSubmissions, error: submissionsError } = await adminClient
      .from('form_submissions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('[paymentsService] ❌ Error fetching user submissions:', submissionsError);
      throw new Error(`Submissions fetch failed: ${submissionsError.message}`);
    }

    if (!userSubmissions || userSubmissions.length === 0) {
      console.log(`[paymentsService] ⚠️ No submissions found for user ${userId}`);
      return [];
    }

    const submissionIds = userSubmissions.map(s => s.id);
    console.log(`[paymentsService] 📋 Found ${submissionIds.length} submissions for user, fetching payments...`);

    return await fetchPayments(submissionIds);
  } catch (error) {
    console.error('[paymentsService] ❌ Error in fetchPaymentsByUserId:', error);
    throw new Error(`User payments fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// New direct query strategy as ultimate fallback
export const fetchPaymentsDirectQuery = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🎯 Direct query strategy for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    // Direct JOIN query to get payments for user
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('purchases')
      .select(`
        id,
        form_submission_id,
        amount,
        currency,
        payment_status,
        has_document_retrieval,
        stripe_session_id,
        stripe_payment_id,
        created_at,
        updated_at,
        form_submissions!inner (
          id,
          user_id,
          state
        )
      `)
      .eq('form_submissions.user_id', userId)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Direct query error:', paymentsError);
      throw new Error(`Direct payment query failed: ${paymentsError.message}`);
    }

    console.log(`[paymentsService] 🎯 Direct query result:`, paymentsData);

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ Direct query found no payments for user ${userId}`);
      return [];
    }

    // Validate payments from direct query
    const validPayments = paymentsData.filter(payment => isValidPayment(payment));
    
    console.log(`[paymentsService] 🎯 Direct query validated ${validPayments.length} payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Error in fetchPaymentsDirectQuery:', error);
    throw new Error(`Direct query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
