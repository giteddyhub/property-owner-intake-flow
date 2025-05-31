
import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign } from 'lucide-react';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentRow } from './payments/PaymentRow';
import { PaymentDetails } from './payments/PaymentDetails';
import { AccountPaymentsTabProps } from './payments/types';
import { formatCurrency, validatePayment } from './payments/utils';

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
  const validPayments = useMemo(() => {
    if (!Array.isArray(payments)) {
      console.error(`[AccountPaymentsTab] ❌ Payments is not an array:`, typeof payments, payments);
      return [];
    }

    const filtered = payments.filter((payment, index) => validatePayment(payment, index));

    console.log(`[AccountPaymentsTab] ✅ Filtered ${filtered.length} valid payments from ${payments.length} total`);
    return filtered;
  }, [payments]);

  const togglePaymentExpansion = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const totalRevenue = useMemo(() => {
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
              {validPayments.map(payment => (
                <React.Fragment key={payment.id}>
                  <PaymentRow
                    payment={payment}
                    isExpanded={expandedPayment === payment.id}
                    onToggleExpansion={togglePaymentExpansion}
                  />
                  {expandedPayment === payment.id && (
                    <PaymentDetails payment={payment} />
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
