
import { useState, useCallback } from 'react';

// Simplified form submission handler - no longer needed for complex form flows
export const useFormSubmissionHandler = () => {
  const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);

  // Simplified - just clear any legacy session data
  const processPendingFormData = useCallback(async (userId: string) => {
    console.log("[FormSubmissionHandler] Clearing legacy form data for modern flow");
    
    // Clear any legacy session storage
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    sessionStorage.removeItem('emailJustVerified');
    sessionStorage.removeItem('processFormDataNow');
    sessionStorage.removeItem('forceRetrySubmission');
    sessionStorage.removeItem('submissionError');
    
    setSubmissionCompleted(true);
  }, []);

  return {
    processingSubmission,
    setProcessingSubmission,
    submissionCompleted,
    setSubmissionCompleted,
    processPendingFormData
  };
};
