
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
import { formatCurrency } from './payments/utils';

export const AccountPaymentsTab: React.FC<AccountPaymentsTabProps> = ({ payments }) => {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  // Ultra-comprehensive debugging
  useEffect(() => {
    console.log(`[AccountPaymentsTab] 🎯 COMPONENT RENDER - ULTIMATE PAYMENTS DEBUG`);
    console.log(`[AccountPaymentsTab] 📦 Payments received:`, payments);
    console.log(`[AccountPaymentsTab] 📊 Payments type:`, typeof payments);
    console.log(`[AccountPaymentsTab] 🔍 Is Array:`, Array.isArray(payments));
    console.log(`[AccountPaymentsTab] 📈 Count:`, payments?.length || 0);
    console.log(`[AccountPaymentsTab] ⏰ Timestamp:`, new Date().toISOString());

    if (Array.isArray(payments) && payments.length > 0) {
      console.log(`[AccountPaymentsTab] 💳 DETAILED PAYMENT BREAKDOWN:`);
      payments.forEach((payment, index) => {
        console.log(`[AccountPaymentsTab] 💰 Payment ${index + 1}:`, {
          id: payment?.id,
          amount: payment?.amount,
          status: payment?.payment_status,
          submissionId: payment?.form_submission_id,
          createdAt: payment?.created_at,
          currency: payment?.currency,
          hasDocRetrieval: payment?.has_document_retrieval,
          stripeSessionId: payment?.stripe_session_id,
          fullPaymentObject: payment
        });
      });
    } else {
      console.log(`[AccountPaymentsTab] ❌ NO PAYMENTS FOUND OR INVALID DATA:`, {
        paymentsValue: payments,
        isNull: payments === null,
        isUndefined: payments === undefined,
        isEmpty: Array.isArray(payments) && payments.length === 0,
        actualValue: payments
      });
    }
  }, [payments]);

  // Extremely simple validation - just check if it's an object with an id
  const validPayments = useMemo(() => {
    console.log(`[AccountPaymentsTab] 🔄 VALIDATION PHASE STARTING...`);
    
    if (!Array.isArray(payments)) {
      console.error(`[AccountPaymentsTab] ❌ CRITICAL: Payments is not an array:`, typeof payments, payments);
      return [];
    }

    const filtered = payments.filter((payment, index) => {
      console.log(`[AccountPaymentsTab] 🧪 Validating payment ${index + 1}:`, payment);
      
      if (!payment || typeof payment !== 'object') {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} is not a valid object:`, payment);
        return false;
      }
      
      if (!payment.id) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} missing ID:`, payment);
        return false;
      }

      if (payment.amount === null || payment.amount === undefined) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} has no amount:`, payment.amount);
        return false;
      }
      
      console.log(`[AccountPaymentsTab] ✅ Payment ${index + 1} is VALID:`, {
        id: payment.id,
        amount: payment.amount,
        status: payment.payment_status
      });
      return true;
    });

    console.log(`[AccountPaymentsTab] 🎯 VALIDATION COMPLETE:`, {
      originalCount: payments.length,
      validatedCount: filtered.length,
      rejectedCount: payments.length - filtered.length,
      validPaymentIds: filtered.map(p => p.id),
      validPayments: filtered.map(p => ({ 
        id: p.id, 
        amount: p.amount, 
        status: p.payment_status,
        submissionId: p.form_submission_id 
      }))
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
      console.log(`[AccountPaymentsTab] 💰 Adding to total: ${validAmount} (from ${payment.amount})`);
      return sum + validAmount;
    }, 0);

    console.log(`[AccountPaymentsTab] 📊 TOTAL REVENUE CALCULATION:`, {
      total,
      paymentsUsed: validPayments.length,
      breakdown: validPayments.map(p => ({ 
        id: p.id, 
        originalAmount: p.amount,
        numericAmount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
      }))
    });
    return total;
  }, [validPayments]);

  console.log(`[AccountPaymentsTab] 🎬 FINAL RENDER STATE:`, {
    totalRevenue,
    validPaymentsCount: validPayments.length,
    originalPaymentsCount: payments?.length || 0,
    willShowTable: validPayments.length > 0,
    renderingPayments: validPayments.length > 0
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
                Raw payments received: {payments?.length || 0} items
              </p>
              <p className="text-xs text-gray-400">
                Check browser console for detailed debugging information
              </p>
              <p className="text-xs text-gray-300 mt-2 font-mono">
                Debug: payments={JSON.stringify(payments?.slice(0, 2))}
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
