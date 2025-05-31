
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { AlertTriangle, DollarSign } from 'lucide-react';

interface AccountPaymentsTabProps {
  payments: PaymentData[];
}

export const AccountPaymentsTab: React.FC<AccountPaymentsTabProps> = ({ payments }) => {
  const formatCurrency = (amount: number | string, currency: string = 'eur') => {
    // Handle different amount formats
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
      return '€0.00';
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'EUR',
    });
    
    return formatter.format(numericAmount);
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

  // Debug information for troubleshooting
  const debugPayments = payments.length > 0;
  const totalRevenue = payments.reduce((sum, payment) => {
    const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payments
        </CardTitle>
        <CardDescription>
          {payments.length === 0 
            ? 'This user has no payment records.' 
            : `${payments.length} payment(s) found for this user. Total revenue: ${formatCurrency(totalRevenue)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {debugPayments && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Payment Debug Information</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Total payments found: {payments.length}</div>
              <div>Payments with valid amounts: {payments.filter(p => {
                const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
                return !isNaN(amount) && amount > 0;
              }).length}</div>
              <div>Payments with pending status: {payments.filter(p => p.payment_status === 'pending').length}</div>
              <div>Payments with paid status: {payments.filter(p => p.payment_status === 'paid').length}</div>
            </div>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payment records found for this user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Retrieval</TableHead>
                <TableHead>Stripe Session ID</TableHead>
                <TableHead>Stripe Payment ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(payment => {
                const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
                const isValidAmount = !isNaN(amount) && amount > 0;
                
                return (
                  <TableRow key={payment.id}>
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
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_session_id ? (
                        <span title={payment.stripe_session_id}>
                          {payment.stripe_session_id.substring(0, 20)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_payment_id ? (
                        <span title={payment.stripe_payment_id}>
                          {payment.stripe_payment_id.substring(0, 20)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
