
import { parsePaymentAmount } from '../utils/paymentUtils';

export const fetchPaymentData = async (
  adminSupabase: any,
  currentMonth: { startOfMonth: Date; endOfMonth: Date },
  previousMonth: { startOfMonth: Date; endOfMonth: Date }
) => {
  const paymentFields = 'id, amount, created_at, payment_status, form_submission_id, currency';

  const [
    allPaymentsResult,
    currentMonthPaymentsResult,
    previousMonthPaymentsResult
  ] = await Promise.all([
    adminSupabase
      .from('purchases')
      .select(paymentFields)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .then((result: any) => {
        console.log('📋 ALL PAYMENTS QUERY RESULT (ADMIN CLIENT):');
        console.log('  Error:', result.error);
        console.log('  Data count:', result.data?.length || 0);
        if (result.error) {
          console.error('❌ ALL PAYMENTS ERROR (ADMIN CLIENT):', result.error);
        } else if (result.data && result.data.length > 0) {
          console.log('🎉 ADMIN CLIENT SUCCESSFULLY RETRIEVED PAYMENTS!');
          result.data.forEach((payment: any, index: number) => {
            console.log(`  Payment ${index + 1}: €${payment.amount} (${payment.payment_status}) - ${payment.created_at}`);
          });
        } else {
          console.warn('⚠️ ADMIN CLIENT: No payments found in database');
        }
        return result;
      }),

    adminSupabase
      .from('purchases')
      .select(paymentFields)
      .eq('payment_status', 'paid')
      .gte('created_at', currentMonth.startOfMonth.toISOString())
      .lte('created_at', currentMonth.endOfMonth.toISOString())
      .then((result: any) => {
        console.log('📋 CURRENT MONTH PAYMENTS (ADMIN CLIENT):', {
          error: result.error,
          count: result.data?.length || 0,
          dateRange: `${currentMonth.startOfMonth.toISOString()} to ${currentMonth.endOfMonth.toISOString()}`
        });
        if (result.error) console.error('❌ CURRENT MONTH PAYMENTS ERROR (ADMIN CLIENT):', result.error);
        return result;
      }),

    adminSupabase
      .from('purchases')
      .select(paymentFields)
      .eq('payment_status', 'paid')
      .gte('created_at', previousMonth.startOfMonth.toISOString())
      .lte('created_at', previousMonth.endOfMonth.toISOString())
      .then((result: any) => {
        console.log('📋 PREVIOUS MONTH PAYMENTS (ADMIN CLIENT):', {
          error: result.error,
          count: result.data?.length || 0,
          dateRange: `${previousMonth.startOfMonth.toISOString()} to ${previousMonth.endOfMonth.toISOString()}`
        });
        if (result.error) console.error('❌ PREVIOUS MONTH PAYMENTS ERROR (ADMIN CLIENT):', result.error);
        return result;
      })
  ]);

  // Check for payment query errors
  if (allPaymentsResult.error) {
    console.error('❌ ALL PAYMENTS QUERY FAILED (ADMIN CLIENT):', allPaymentsResult.error);
    throw new Error(`All payments query failed: ${allPaymentsResult.error.message}`);
  }

  // Extract payment data with comprehensive logging
  const allPayments = allPaymentsResult.data || [];
  const currentMonthPayments = currentMonthPaymentsResult.data || [];
  const previousMonthPayments = previousMonthPaymentsResult.data || [];

  console.log('💳 PAYMENT DATA ANALYSIS (ADMIN CLIENT):');
  console.log(`  📈 Total payments retrieved: ${allPayments.length}`);
  console.log(`  📅 Current month payments: ${currentMonthPayments.length}`);
  console.log(`  📅 Previous month payments: ${previousMonthPayments.length}`);

  // Enhanced revenue calculation with step-by-step tracking
  console.log('🧮 STARTING REVENUE CALCULATIONS (ADMIN CLIENT)...');
  
  let totalRevenue = 0;
  let validPaymentCount = 0;
  let invalidPaymentCount = 0;
  
  console.log(`📊 Processing ${allPayments.length} payments for total revenue...`);
  
  allPayments.forEach((payment: any, index: number) => {
    const amount = parsePaymentAmount(payment, index, 'ALL_ADMIN');
    if (amount > 0) {
      totalRevenue += amount;
      validPaymentCount++;
      console.log(`💰 Payment ${index + 1}: Added €${amount}. Running total: €${totalRevenue}`);
    } else {
      invalidPaymentCount++;
      console.log(`❌ Payment ${index + 1}: Skipped (invalid amount)`);
    }
  });

  console.log(`📊 TOTAL REVENUE CALCULATION SUMMARY (ADMIN CLIENT):`, {
    totalPaymentsProcessed: allPayments.length,
    validPayments: validPaymentCount,
    invalidPayments: invalidPaymentCount,
    finalTotalRevenue: totalRevenue,
    formattedTotal: `€${totalRevenue.toLocaleString()}`
  });

  // Current month revenue calculation
  let currentMonthRevenue = 0;
  currentMonthPayments.forEach((payment: any, index: number) => {
    const amount = parsePaymentAmount(payment, index, 'CURRENT_MONTH_ADMIN');
    if (amount > 0) {
      currentMonthRevenue += amount;
    }
  });

  // Previous month revenue calculation
  let previousMonthRevenue = 0;
  previousMonthPayments.forEach((payment: any, index: number) => {
    const amount = parsePaymentAmount(payment, index, 'PREVIOUS_MONTH_ADMIN');
    if (amount > 0) {
      previousMonthRevenue += amount;
    }
  });

  console.log('💰 FINAL REVENUE SUMMARY (ADMIN CLIENT):');
  console.log(`  🏆 Total Revenue: €${totalRevenue} (from ${validPaymentCount} payments)`);
  console.log(`  📅 Current Month: €${currentMonthRevenue}`);
  console.log(`  📅 Previous Month: €${previousMonthRevenue}`);

  return {
    totalRevenue,
    currentMonthRevenue,
    previousMonthRevenue
  };
};
