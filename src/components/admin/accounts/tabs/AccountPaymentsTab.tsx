
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentData } from '@/types/admin';

interface AccountPaymentsTabProps {
  payments: PaymentData[];
}

export const AccountPaymentsTab: React.FC<AccountPaymentsTabProps> = ({ payments }) => {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  // Enhanced logging and validation for debugging
  useEffect(() => {
    console.log(`[AccountPaymentsTab] 🎯 COMPONENT MOUNT/UPDATE:`, {
      paymentsReceived: payments,
      paymentsCount: payments?.length || 0,
      paymentsType: typeof payments,
      isArray: Array.isArray(payments),
      firstPayment: payments?.length > 0 ? payments[0] : 'NO_PAYMENTS'
    });

    // Validate each payment thoroughly
    if (Array.isArray(payments)) {
      payments.forEach((payment, index) => {
        console.log(`[AccountPaymentsTab] 💳 Payment ${index + 1} validation:`, {
          id: payment?.id,
          hasId: !!payment?.id,
          amount: payment?.amount,
          amountType: typeof payment?.amount,
          amountValid: !isNaN(Number(payment?.amount)),
          status: payment?.payment_status,
          submissionId: payment?.form_submission_id,
          createdAt: payment?.created_at,
          isValidObject: payment && typeof payment === 'object'
        });
      });
    }
  }, [payments]);

  // Enhanced validation with comprehensive type checking
  const validPayments = React.useMemo(() => {
    if (!Array.isArray(payments)) {
      console.error(`[AccountPaymentsTab] ❌ Payments is not an array:`, typeof payments, payments);
      return [];
    }

    const filtered = payments.filter((payment, index) => {
      if (!payment) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} is null/undefined`);
        return false;
      }

      if (typeof payment !== 'object') {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} is not an object:`, typeof payment);
        return false;
      }

      if (!payment.id || typeof payment.id !== 'string') {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} has invalid ID:`, payment.id);
        return false;
      }

      if (payment.amount === null || payment.amount === undefined) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} has null/undefined amount:`, payment.amount);
        return false;
      }

      if (isNaN(Number(payment.amount))) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} has invalid amount:`, payment.amount);
        return false;
      }

      return true;
    });

    console.log(`[AccountPaymentsTab] ✅ Filtered ${filtered.length} valid payments from ${payments.length} total`);
    return filtered;
  }, [payments]);

  const togglePaymentExpansion = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const formatCurrency = (amount: number | string, currency: string = 'eur') => {
    console.log(`[AccountPaymentsTab] Formatting currency - amount:`, amount, 'type:', typeof amount, 'currency:', currency);
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
      console.log(`[AccountPaymentsTab] Invalid amount, returning €0.00`);
      return '€0.00';
    }

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase() || 'EUR',
      });
      
      const formatted = formatter.format(numericAmount);
      console.log(`[AccountPaymentsTab] Formatted ${numericAmount} as ${formatted}`);
      return formatted;
    } catch (error) {
      console.error(`[AccountPaymentsTab] Currency formatting error:`, error);
      return `€${numericAmount.toFixed(2)}`;
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
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

  const totalRevenue = React.useMemo(() => {
    const total = validPayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      const validAmount = isNaN(amount) ? 0 : amount;
      console.log(`[AccountPaymentsTab] Adding to total - payment ${payment.id}: ${validAmount}`);
      return sum + validAmount;
    }, 0);

    console.log(`[AccountPaymentsTab] Total revenue calculated: ${total}`);
    return total;
  }, [validPayments]);

  console.log(`[AccountPaymentsTab] 📊 FINAL RENDER STATE:`, {
    totalRevenue,
    validPaymentsCount: validPayments.length,
    originalPaymentsCount: payments?.length || 0,
    willShowTable: validPayments.length > 0,
    renderTimestamp: new Date().toISOString()
  });

  // Enhanced logging for each payment that will be rendered
  validPayments.forEach((payment, index) => {
    console.log(`[AccountPaymentsTab] Payment ${index + 1} render details:`, {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.payment_status,
      created_at: payment.created_at,
      form_submission_id: payment.form_submission_id
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payments {validPayments.length > 0 && `(${validPayments.length})`}
        </CardTitle>
        <CardDescription>
          {validPayments.length === 0 
            ? 'This user has no payment records.' 
            : `${validPayments.length} payment(s) found for this user. Total revenue: ${formatCurrency(totalRevenue)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="space-y-2">
              <p>No payment records found for this user.</p>
              <p className="text-sm text-gray-500">
                Debug info: Received {payments?.length || 0} payments, filtered to {validPayments.length} valid payments
              </p>
              <p className="text-xs text-gray-400">
                Check browser console for detailed payment validation logs
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Retrieval</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validPayments.map(payment => {
                console.log(`[AccountPaymentsTab] Rendering payment row:`, payment);
                
                const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
                const isValidAmount = !isNaN(amount) && amount > 0;
                
                return (
                  <React.Fragment key={payment.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => togglePaymentExpansion(payment.id)}
                    >
                      <TableCell>
                        {expandedPayment === payment.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatCurrency(payment.amount, payment.currency)}
                          {!isValidAmount && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                              Invalid Amount
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPaymentStatusBadgeClass(payment.payment_status)}
                        >
                          {payment.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.has_document_retrieval ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Included
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Not Included
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Stripe</Badge>
                      </TableCell>
                    </TableRow>
                    {expandedPayment === payment.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/20">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Payment ID:</span>
                                <p className="font-mono text-xs">{payment.id}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Amount:</span>
                                <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Currency:</span>
                                <p className="uppercase">{payment.currency}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Status:</span>
                                <Badge
                                  variant="outline"
                                  className={getPaymentStatusBadgeClass(payment.payment_status)}
                                >
                                  {payment.payment_status}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Form Submission ID:</span>
                                <p className="font-mono text-xs">{payment.form_submission_id || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Document Retrieval:</span>
                                <p>{payment.has_document_retrieval ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Created:</span>
                                <p>{format(new Date(payment.created_at), 'PPpp')}</p>
                              </div>
                            </div>
                            
                            {(payment.stripe_session_id || payment.stripe_payment_id) && (
                              <div className="border-t pt-4">
                                <h4 className="font-medium text-sm mb-2">Stripe Information</h4>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  {payment.stripe_session_id && (
                                    <div>
                                      <span className="font-medium text-muted-foreground">Session ID:</span>
                                      <p className="font-mono text-xs break-all">{payment.stripe_session_id}</p>
                                    </div>
                                  )}
                                  {payment.stripe_payment_id && (
                                    <div>
                                      <span className="font-medium text-muted-foreground">Payment ID:</span>
                                      <p className="font-mono text-xs break-all">{payment.stripe_payment_id}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
