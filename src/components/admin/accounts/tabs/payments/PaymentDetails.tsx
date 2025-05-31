
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { PaymentDetailsProps } from './types';
import { formatCurrency, getPaymentStatusBadgeClass } from './utils';

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment }) => {
  return (
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
  );
};
