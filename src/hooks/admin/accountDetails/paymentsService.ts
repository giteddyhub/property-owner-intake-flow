
import { supabase } from '@/integrations/supabase/client';
import { PaymentData } from '@/types/admin';

export const fetchPayments = async (submissionIds: string[]): Promise<PaymentData[]> => {
  if (submissionIds.length === 0) return [];

  console.log('Fetching payments for submission IDs:', submissionIds);

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      form_submissions:form_submission_id (state)
    `)
    .in('form_submission_id', submissionIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }

  console.log('Raw payment data from database:', data);

  // Log each payment to debug the amount and status issues
  data?.forEach((payment, index) => {
    console.log(`Payment ${index + 1}:`, {
      id: payment.id,
      amount: payment.amount,
      amountType: typeof payment.amount,
      currency: payment.currency,
      payment_status: payment.payment_status,
      stripe_session_id: payment.stripe_session_id,
      stripe_payment_id: payment.stripe_payment_id,
      has_document_retrieval: payment.has_document_retrieval,
      created_at: payment.created_at
    });
  });

  return data || [];
};
