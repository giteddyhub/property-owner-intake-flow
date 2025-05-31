
import { supabase } from '@/integrations/supabase/client';
import { PaymentData } from '@/types/admin';

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  console.log(`[paymentsService] Starting fetchPayments with ${submissionIds.length} submission IDs:`, submissionIds);
  
  if (submissionIds.length === 0) {
    console.log(`[paymentsService] No submission IDs provided, returning empty array`);
    return [];
  }

  // Fetch all payments for the given submission IDs
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      form_submissions:form_submission_id (state)
    `)
    .in('form_submission_id', submissionIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[paymentsService] Error fetching payments:', error);
    throw error; // Throw error instead of returning empty array to surface issues
  }

  console.log(`[paymentsService] Raw payment data from database:`, data);
  console.log(`[paymentsService] Found ${data?.length || 0} payments`);

  if (!data || data.length === 0) {
    console.log(`[paymentsService] No payments found for submission IDs:`, submissionIds);
    return [];
  }

  // Log each payment with detailed information
  data.forEach((payment, index) => {
    console.log(`[paymentsService] Payment ${index + 1}:`, {
      id: payment.id,
      amount: payment.amount,
      amountType: typeof payment.amount,
      currency: payment.currency,
      payment_status: payment.payment_status,
      stripe_session_id: payment.stripe_session_id,
      form_submission_id: payment.form_submission_id,
      created_at: payment.created_at
    });
    
    // Specifically check for the €295 payment
    if (payment.amount && (Number(payment.amount) === 295 || payment.amount.toString().includes('295'))) {
      console.log(`[paymentsService] ⭐ FOUND €295 PAYMENT:`, payment);
    }
  });

  console.log(`[paymentsService] Successfully returning ${data.length} payments`);
  return data;
};
