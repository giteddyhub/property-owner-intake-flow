
import { PaymentData } from '@/types/admin';

export interface AccountPaymentsTabProps {
  payments: PaymentData[];
}

export interface PaymentRowProps {
  payment: PaymentData;
  isExpanded: boolean;
  onToggleExpansion: (paymentId: string) => void;
}

export interface PaymentDetailsProps {
  payment: PaymentData;
}
