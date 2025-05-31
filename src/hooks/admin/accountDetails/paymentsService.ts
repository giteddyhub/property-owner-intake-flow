
import { supabase } from '@/integrations/supabase/client';
import { PaymentData } from '@/types/admin';

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  console.log(`[paymentsService] Starting fetchPayments with submission IDs:`, submissionIds);
  
  if (submissionIds.length === 0) {
    console.log(`[paymentsService] No submission IDs provided, returning empty array`);
    return [];
  }

  console.log(`[paymentsService] Fetching payments for ${submissionIds.length} submission IDs:`, submissionIds);

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
    return [];
  }

  console.log(`[paymentsService] Raw payment data from database:`, data);
  console.log(`[paymentsService] Found ${data?.length || 0} payments`);

  // Log each payment to debug the amount and status issues
  data?.forEach((payment, index) => {
    console.log(`[paymentsService] Payment ${index + 1}:`, {
      id: payment.id,
      amount: payment.amount,
      amountType: typeof payment.amount,
      amountValue: payment.amount,
      currency: payment.currency,
      payment_status: payment.payment_status,
      stripe_session_id: payment.stripe_session_id,
      stripe_payment_id: payment.stripe_payment_id,
      has_document_retrieval: payment.has_document_retrieval,
      form_submission_id: payment.form_submission_id,
      created_at: payment.created_at
    });
    
    // Check if this is the missing 295 EUR payment
    if (payment.amount && (Number(payment.amount) === 295 || payment.amount.toString().includes('295'))) {
      console.log(`[paymentsService] ⭐ FOUND POTENTIAL 295 EUR PAYMENT:`, payment);
    }
  });

  const processedPayments = data || [];
  console.log(`[paymentsService] Returning ${processedPayments.length} payments`);
  
  return processedPayments;
};
