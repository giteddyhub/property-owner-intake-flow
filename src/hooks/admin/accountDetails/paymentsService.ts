
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
    // First, let's check if any payments exist at all for debugging
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('purchases')
      .select('id, form_submission_id, amount, payment_status')
      .limit(10);

    if (allPaymentsError) {
      console.error('[paymentsService] ❌ Error checking all payments:', allPaymentsError);
    } else {
      console.log(`[paymentsService] 📊 Total payments in database (sample):`, allPayments);
    }

    // Fetch ALL payments for the given submission IDs with comprehensive selection
    const { data: paymentsData, error: paymentsError } = await supabase
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
      throw paymentsError;
    }

    console.log(`[paymentsService] ✅ Raw payment query result:`, paymentsData);

    if (!paymentsData || paymentsData.length === 0) {
      console.log(`[paymentsService] ⚠️ No payments found for submission IDs:`, submissionIds);
      
      // Let's also check if there are any payments with partial matches
      const { data: partialMatches } = await supabase
        .from('purchases')
        .select('id, form_submission_id, amount, payment_status')
        .or(submissionIds.map(id => `form_submission_id.eq.${id}`).join(','));
      
      console.log(`[paymentsService] 🔍 Partial match check result:`, partialMatches);
      
      return [];
    }

    // Validate and clean the payment data
    const validPayments = paymentsData.filter(payment => {
      const isValid = payment && payment.id && payment.form_submission_id;
      if (!isValid) {
        console.warn(`[paymentsService] ⚠️ Invalid payment data:`, payment);
      }
      return isValid;
    });

    // Log detailed payment information
    console.log(`[paymentsService] 💰 Found ${validPayments.length} valid payments:`);
    validPayments.forEach((payment, index) => {
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
    const paidPayments = validPayments.filter(p => p.payment_status === 'paid');
    const highValuePayments = validPayments.filter(p => Number(p.amount || 0) > 200);
    
    console.log(`[paymentsService] 🎯 Analysis:`, {
      totalPayments: validPayments.length,
      paidPayments: paidPayments.length,
      highValuePayments: highValuePayments.length,
      totalAmount: validPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    });

    console.log(`[paymentsService] ✅ Successfully returning ${validPayments.length} payments`);
    return validPayments;

  } catch (error) {
    console.error('[paymentsService] ❌ Unexpected error in fetchPayments:', error);
    throw error;
  }
};

// New function to fetch payments directly by user ID as a fallback
export const fetchPaymentsByUserId = async (userId: string): Promise<PaymentData[]> => {
  console.log(`[paymentsService] 🔄 Fetching payments directly by user ID: ${userId}`);
  
  try {
    // Get all submissions for this user first
    const { data: userSubmissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('user_id', userId);

    if (submissionsError) {
      console.error('[paymentsService] ❌ Error fetching user submissions:', submissionsError);
      throw submissionsError;
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
    throw error;
  }
};
