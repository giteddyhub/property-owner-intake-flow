
import { supabase } from '@/integrations/supabase/client';
import { PaymentData } from '@/types/admin';

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
    // Fetch ALL payments for the given submission IDs
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('purchases')
      .select(`
        *,
        form_submissions:form_submission_id (state)
      `)
      .in('form_submission_id', submissionIds)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('[paymentsService] ❌ Error fetching payments:', paymentsError);
      throw paymentsError;
    }

    console.log(`[paymentsService] ✅ Raw payment query result:`, paymentsData);

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ No payments found for submission IDs:`, submissionIds);
      return [];
    }

    // Log detailed payment information
    console.log(`[paymentsService] 💰 Found ${paymentsData.length} payments:`);
    paymentsData.forEach((payment, index) => {
      console.log(`[paymentsService]   Payment ${index + 1}:`, {
        id: payment.id,
        amount: payment.amount,
        amountType: typeof payment.amount,
        amountValue: Number(payment.amount || 0),
        currency: payment.currency,
        status: payment.payment_status,
        submissionId: payment.form_submission_id,
        createdAt: payment.created_at
      });
    });

    // Check for the specific payments we know should exist
    const paidPayments = paymentsData.filter(p => p.payment_status === 'paid');
    const highValuePayments = paymentsData.filter(p => Number(p.amount || 0) > 200);
    
    console.log(`[paymentsService] 🎯 Analysis:`, {
      totalPayments: paymentsData.length,
      paidPayments: paidPayments.length,
      highValuePayments: highValuePayments.length,
      totalAmount: paymentsData.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    });

    console.log(`[paymentsService] ✅ Successfully returning ${paymentsData.length} payments`);
    return paymentsData;

  } catch (error) {
    console.error('[paymentsService] ❌ Unexpected error in fetchPayments:', error);
    throw error;
  }
};
