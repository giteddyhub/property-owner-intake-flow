
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';
import { AccountDetails, FormSubmission } from '../types';

export interface OptimizedAccountData {
  loading: boolean;
  account: AccountDetails | null;
  submissions: FormSubmission[];
  properties: PropertyData[];
  owners: OwnerData[];
  assignments: AssignmentData[];
  payments: PaymentData[];
  activities: UserActivityData[];
  refetch: () => Promise<void>;
}

export interface AccountMetrics {
  hasCompletedSetup: boolean;
  totalPaymentAmount: number;
  submissionsCount: number;
  propertiesCount: number;
  ownersCount: number;
  paymentsCount: number;
  activitiesCount: number;
}
