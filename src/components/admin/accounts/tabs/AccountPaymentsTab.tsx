
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

  // Enhanced debugging with more detailed logging
  useEffect(() => {
    console.log(`[AccountPaymentsTab] 🎯 COMPONENT RENDER DEBUG:`, {
      paymentsReceived: payments,
      paymentsCount: payments?.length || 0,
      paymentsType: typeof payments,
      isArray: Array.isArray(payments),
      firstPayment: payments?.length > 0 ? payments[0] : 'NO_PAYMENTS',
      allPaymentIds: payments?.map(p => p?.id) || [],
      renderTimestamp: new Date().toISOString()
    });

    // Enhanced individual payment analysis
    if (Array.isArray(payments)) {
      payments.forEach((payment, index) => {
        console.log(`[AccountPaymentsTab] 💳 PAYMENT ${index + 1} ANALYSIS:`, {
          payment,
          id: payment?.id,
          hasId: !!payment?.id,
          amount: payment?.amount,
          amountType: typeof payment?.amount,
          amountValue: payment?.amount,
          amountValid: payment?.amount !== null && payment?.amount !== undefined,
          status: payment?.payment_status,
          submissionId: payment?.form_submission_id,
          createdAt: payment?.created_at,
          isValidObject: payment && typeof payment === 'object',
          allKeys: payment ? Object.keys(payment) : 'no keys'
        });
      });
    } else {
      console.error(`[AccountPaymentsTab] ❌ CRITICAL: payments prop is not an array!`, {
        paymentsType: typeof payments,
        paymentsValue: payments
      });
    }
  }, [payments]);

  // Simplified validation
  const validPayments = useMemo(() => {
    console.log(`[AccountPaymentsTab] 🔄 VALIDATION PROCESS STARTING...`);
    
    if (!Array.isArray(payments)) {
      console.error(`[AccountPaymentsTab] ❌ FATAL: Payments is not an array:`, typeof payments, payments);
      return [];
    }

    console.log(`[AccountPaymentsTab] ✅ Payments is an array with ${payments.length} items`);

    // Use more lenient validation
    const filtered = payments.filter((payment, index) => {
      console.log(`[AccountPaymentsTab] 🔍 Validating payment ${index + 1}/${payments.length}:`, payment);
      
      if (!payment) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} is null/undefined`);
        return false;
      }
      
      if (!payment.id) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} missing ID:`, payment);
        return false;
      }
      
      console.log(`[AccountPaymentsTab] ✅ Payment ${index + 1} passed basic validation`);
      return true;
    });

    console.log(`[AccountPaymentsTab] 🎯 VALIDATION COMPLETE:`, {
      originalCount: payments.length,
      validatedCount: filtered.length,
      filteredOut: payments.length - filtered.length,
      validPayments: filtered.map(p => ({ id: p.id, amount: p.amount }))
    });

    return filtered;
  }, [payments]);

  const togglePaymentExpansion = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const totalRevenue = useMemo(() => {
    const total = validPayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      const validAmount = isNaN(amount) ? 0 : amount;
      console.log(`[AccountPaymentsTab] 💰 Adding to total - payment ${payment.id}: ${validAmount} (original: ${payment.amount})`);
      return sum + validAmount;
    }, 0);

    console.log(`[AccountPaymentsTab] 📊 TOTAL REVENUE CALCULATED:`, {
      total,
      paymentsUsed: validPayments.length,
      calculation: validPayments.map(p => ({ id: p.id, amount: p.amount, parsed: parseFloat(String(p.amount)) }))
    });
    return total;
  }, [validPayments]);

  console.log(`[AccountPaymentsTab] 🎬 FINAL RENDER STATE:`, {
    totalRevenue,
    validPaymentsCount: validPayments.length,
    originalPaymentsCount: payments?.length || 0,
    willShowTable: validPayments.length > 0,
    expandedPayment,
    renderTimestamp: new Date().toISOString()
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
                Debug info: Received {payments?.length || 0} payments, validated {validPayments.length} payments
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
