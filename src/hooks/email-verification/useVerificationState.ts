
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

export const useVerificationState = () => {
  const navigate = useNavigate();
  const { user, processingSubmission, submissionCompleted } = useAuth();
  const userEmail = sessionStorage.getItem('pendingUserEmail') || 'your email';
  const [verificationStatus, setVerificationStatus] = useState<'pending'|'verified'|'failed'>('pending');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Get submission data from session storage
  const hasPendingFormData = sessionStorage.getItem('pendingFormData') !== null;
  const formSubmittedDuringSignup = sessionStorage.getItem('formSubmittedDuringSignup') === 'true';
  const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
  const emailJustVerified = sessionStorage.getItem('emailJustVerified') === 'true';

  // Check for submission errors
  useState(() => {
    const errorMsg = sessionStorage.getItem('submissionError');
    if (errorMsg) {
      setSubmissionError(errorMsg);
    }
  });

  // Handle automatic redirect if coming from email verification link
  useState(() => {
    if (emailJustVerified) {
      console.log("[useVerificationState] Email was just verified via link, preparing quick redirect");
      setVerificationStatus('verified');
      setRedirecting(true);
      
      // Clear the flag
      sessionStorage.removeItem('emailJustVerified');
      
      // Show a notification
      toast.success("Email verified successfully! Redirecting to dashboard...");
      
      // Redirect to dashboard immediately
      navigate('/dashboard', { replace: true });
    }
  });

  return {
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
  };
};
