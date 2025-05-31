
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

  // Comprehensive debugging
  useEffect(() => {
    console.log(`[AccountPaymentsTab] 🎯 COMPONENT RENDER - PAYMENTS DEBUG:`, {
      paymentsReceived: payments,
      paymentsCount: payments?.length || 0,
      paymentsType: typeof payments,
      isArray: Array.isArray(payments),
      timestamp: new Date().toISOString()
    });

    if (Array.isArray(payments) && payments.length > 0) {
      console.log(`[AccountPaymentsTab] 💳 DETAILED PAYMENT ANALYSIS:`);
      payments.forEach((payment, index) => {
        console.log(`[AccountPaymentsTab] Payment ${index + 1}:`, {
          id: payment?.id,
          amount: payment?.amount,
          status: payment?.payment_status,
          submissionId: payment?.form_submission_id,
          createdAt: payment?.created_at,
          fullPayment: payment
        });
      });
    } else {
      console.log(`[AccountPaymentsTab] ⚠️ NO PAYMENTS or INVALID DATA:`, {
        paymentsValue: payments,
        isNull: payments === null,
        isUndefined: payments === undefined,
        isEmpty: Array.isArray(payments) && payments.length === 0
      });
    }
  }, [payments]);

  // Very simple validation - just check if it's an object with an id
  const validPayments = useMemo(() => {
    console.log(`[AccountPaymentsTab] 🔄 VALIDATION STARTING...`);
    
    if (!Array.isArray(payments)) {
      console.error(`[AccountPaymentsTab] ❌ Payments is not an array:`, typeof payments, payments);
      return [];
    }

    const filtered = payments.filter((payment, index) => {
      if (!payment || typeof payment !== 'object') {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} is not a valid object:`, payment);
        return false;
      }
      
      if (!payment.id) {
        console.error(`[AccountPaymentsTab] ❌ Payment ${index + 1} missing ID:`, payment);
        return false;
      }
      
      console.log(`[AccountPaymentsTab] ✅ Payment ${index + 1} is valid:`, payment.id);
      return true;
    });

    console.log(`[AccountPaymentsTab] 🎯 VALIDATION COMPLETE:`, {
      originalCount: payments.length,
      validatedCount: filtered.length,
      validPayments: filtered.map(p => ({ id: p.id, amount: p.amount, status: p.payment_status }))
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
      return sum + validAmount;
    }, 0);

    console.log(`[AccountPaymentsTab] 📊 TOTAL REVENUE:`, {
      total,
      paymentsUsed: validPayments.length,
      breakdown: validPayments.map(p => ({ id: p.id, amount: p.amount }))
    });
    return total;
  }, [validPayments]);

  console.log(`[AccountPaymentsTab] 🎬 FINAL RENDER STATE:`, {
    totalRevenue,
    validPaymentsCount: validPayments.length,
    originalPaymentsCount: payments?.length || 0,
    willShowTable: validPayments.length > 0
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
