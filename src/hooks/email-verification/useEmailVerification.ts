
import { useVerificationState } from './useVerificationState';
import { useVerificationMonitor } from './useVerificationMonitor';

export const useEmailVerification = () => {
  const {
    userEmail,
    verificationStatus,
    setVerificationStatus,
    submissionError,
    setSubmissionError,
    redirecting,
    setRedirecting,
    hasPendingFormData,
    formSubmittedDuringSignup,
    forceRetry,
    processingSubmission,
    submissionCompleted,
    user
  } = useVerificationState();
  
  // Setup verification monitoring
  useVerificationMonitor(
    verificationStatus,
    setVerificationStatus,
    redirecting,
    formSubmittedDuringSignup,
    user
  );
  
  return {
    userEmail,
    verificationStatus,
    submissionError,
    redirecting,
    hasPendingFormData,
    formSubmittedDuringSignup,
    forceRetry,
    processingSubmission,
    submissionCompleted
  };
};
