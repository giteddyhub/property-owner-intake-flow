
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

interface AccountPaymentsTabProps {
  payments: PaymentData[];
}

export const AccountPaymentsTab: React.FC<AccountPaymentsTabProps> = ({ payments }) => {
  const formatCurrency = (amount: number, currency: string = 'eur') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'EUR',
    });
    
    return formatter.format(amount);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>
          {payments.length === 0 
            ? 'This user has no payment records.' 
            : `${payments.length} payment(s) found for this user.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <TableHead>Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(payment.amount, payment.currency)}
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
                    {payment.stripe_payment_id 
                      ? payment.stripe_payment_id.substring(0, 12) + '...' 
                      : 'None'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
