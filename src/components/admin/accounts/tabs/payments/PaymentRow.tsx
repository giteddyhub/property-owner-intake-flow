
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { PaymentRowProps } from './types';
import { formatCurrency, getPaymentStatusBadgeClass } from './utils';

export const PaymentRow: React.FC<PaymentRowProps> = ({ 
  payment, 
  isExpanded, 
  onToggleExpansion 
}) => {
  const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
  const isValidAmount = !isNaN(amount) && amount > 0;

  console.log(`[PaymentRow] Rendering payment row:`, payment);

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onToggleExpansion(payment.id)}
    >
      <TableCell>
        {isExpanded ? (
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
  );
};
