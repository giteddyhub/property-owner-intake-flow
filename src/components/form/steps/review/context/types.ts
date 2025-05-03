
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

export type ReviewStepContextType = {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  submissionInProgress: boolean;
  setSubmissionInProgress: (value: boolean) => void;
  submissionAttempted: boolean;
  setSubmissionAttempted: (value: boolean) => void;
  handleSubmitButtonClick: () => void;
  handleAuthSuccess: () => void;
};

export interface ReviewStepProviderProps {
  children: React.ReactNode;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}
