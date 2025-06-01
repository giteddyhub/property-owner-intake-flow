
// Standardized payment amount parsing with comprehensive logging
export const parsePaymentAmount = (payment: any, index: number, queryType: string = '') => {
  console.log(`🔍 [${queryType} Payment ${index + 1}] Raw payment:`, {
    id: payment?.id,
    amount: payment?.amount,
    amountType: typeof payment?.amount,
    status: payment?.payment_status,
    created_at: payment?.created_at,
    fullObject: payment
  });

  if (!payment) {
    console.error(`❌ [${queryType} Payment ${index + 1}] Payment object is null/undefined`);
    return 0;
  }

  if (payment.amount === null || payment.amount === undefined) {
    console.error(`❌ [${queryType} Payment ${index + 1}] Amount is null/undefined:`, payment);
    return 0;
  }

  let numericAmount: number;
  
  if (typeof payment.amount === 'string') {
    // Remove any currency symbols and parse
    const cleanAmount = payment.amount.replace(/[€$,\s]/g, '');
    numericAmount = parseFloat(cleanAmount);
    console.log(`🔄 [${queryType} Payment ${index + 1}] Parsed string "${payment.amount}" to number: ${numericAmount}`);
  } else if (typeof payment.amount === 'number') {
    numericAmount = payment.amount;
    console.log(`✅ [${queryType} Payment ${index + 1}] Amount already number: ${numericAmount}`);
  } else {
    console.error(`❌ [${queryType} Payment ${index + 1}] Unexpected amount type:`, typeof payment.amount, payment.amount);
    return 0;
  }

  if (isNaN(numericAmount) || numericAmount < 0) {
    console.error(`❌ [${queryType} Payment ${index + 1}] Invalid numeric amount: ${numericAmount} (isNaN: ${isNaN(numericAmount)})`);
    return 0;
  }

  console.log(`✅ [${queryType} Payment ${index + 1}] Valid amount: €${numericAmount}`);
  return numericAmount;
};
