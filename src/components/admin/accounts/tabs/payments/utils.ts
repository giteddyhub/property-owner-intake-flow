
export const formatCurrency = (amount: number | string, currency: string = 'eur') => {
  console.log(`[PaymentUtils] Formatting currency - amount:`, amount, 'type:', typeof amount, 'currency:', currency);
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    console.log(`[PaymentUtils] Invalid amount, returning €0.00`);
    return '€0.00';
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'EUR',
    });
    
    const formatted = formatter.format(numericAmount);
    console.log(`[PaymentUtils] Formatted ${numericAmount} as ${formatted}`);
    return formatted;
  } catch (error) {
    console.error(`[PaymentUtils] Currency formatting error:`, error);
    return `€${numericAmount.toFixed(2)}`;
  }
};

export const getPaymentStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const validatePayment = (payment: any, index: number): boolean => {
  if (!payment) {
    console.error(`[PaymentValidation] Payment ${index + 1} is null/undefined`);
    return false;
  }

  if (typeof payment !== 'object') {
    console.error(`[PaymentValidation] Payment ${index + 1} is not an object:`, typeof payment);
    return false;
  }

  if (!payment.id || typeof payment.id !== 'string') {
    console.error(`[PaymentValidation] Payment ${index + 1} has invalid ID:`, payment.id);
    return false;
  }

  if (payment.amount === null || payment.amount === undefined) {
    console.error(`[PaymentValidation] Payment ${index + 1} has null/undefined amount:`, payment.amount);
    return false;
  }

  if (isNaN(Number(payment.amount))) {
    console.error(`[PaymentValidation] Payment ${index + 1} has invalid amount:`, payment.amount);
    return false;
  }

  return true;
};
