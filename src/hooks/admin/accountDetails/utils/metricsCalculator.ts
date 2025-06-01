
import { PaymentData } from '@/types/admin';
import { FormSubmission } from '../types';
import { AccountMetrics } from '../types/optimizedAccountTypes';

export const calculateAccountMetrics = (
  submissions: FormSubmission[],
  payments: PaymentData[],
  propertiesCount: number,
  ownersCount: number,
  activitiesCount: number
): AccountMetrics => {
  const hasCompletedSetup = submissions.some(s => s.is_primary_submission && s.state === 'completed');
  
  // Calculate total payment amount (all payments)
  const totalPaymentAmount = payments.reduce((sum, p) => {
    const amount = Number(p.amount || 0);
    const validAmount = isNaN(amount) ? 0 : amount;
    if (amount !== validAmount) {
      console.warn(`[metricsCalculator] ⚠️ Invalid payment amount detected:`, {
        paymentId: p.id,
        originalAmount: p.amount,
        convertedAmount: validAmount
      });
    }
    return sum + validAmount;
  }, 0);

  // Calculate paid payment amount (only paid payments)
  const paidPaymentAmount = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => {
      const amount = Number(p.amount || 0);
      const validAmount = isNaN(amount) ? 0 : amount;
      return sum + validAmount;
    }, 0);

  console.log(`[metricsCalculator] 📊 Final calculations:`, {
    hasCompletedSetup,
    totalPaymentAmount,
    paidPaymentAmount,
    paymentsCount: payments.length,
    paidPaymentsCount: payments.filter(p => p.payment_status === 'paid').length,
    submissionsProcessed: submissions.length,
    paymentsBySubmission: payments.reduce((acc, p) => {
      acc[p.form_submission_id || 'null'] = (acc[p.form_submission_id || 'null'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    paymentsByStatus: payments.reduce((acc, p) => {
      acc[p.payment_status || 'unknown'] = (acc[p.payment_status || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return {
    hasCompletedSetup,
    totalPaymentAmount,
    submissionsCount: submissions.length,
    propertiesCount,
    ownersCount,
    paymentsCount: payments.length,
    activitiesCount
  };
};
