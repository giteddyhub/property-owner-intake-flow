
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEmailVerification = () => {
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
  useEffect(() => {
    const errorMsg = sessionStorage.getItem('submissionError');
    if (errorMsg) {
      setSubmissionError(errorMsg);
    }
  }, []);

  // Handle automatic redirect if coming from email verification link
  useEffect(() => {
    if (emailJustVerified) {
      console.log("[useEmailVerification] Email was just verified via link, preparing quick redirect");
      setVerificationStatus('verified');
      setRedirecting(true);
      
      // Clear the flag
      sessionStorage.removeItem('emailJustVerified');
      
      // Show a notification
      toast.success("Email verified successfully! Redirecting to dashboard...");
      
      // Redirect to dashboard immediately
      navigate('/dashboard', { replace: true });
    }
  }, [emailJustVerified, navigate]);
  
  // Monitor authentication state
  useEffect(() => {
    // Skip the rest of this effect if we're already redirecting
    if (redirecting) return;
    
    console.log("[useEmailVerification] Component mounted, current user:", user?.id);
    console.log("[useEmailVerification] Has pending form data:", hasPendingFormData);
    console.log("[useEmailVerification] Processing submission:", processingSubmission);
    console.log("[useEmailVerification] Submission completed:", submissionCompleted);
    console.log("[useEmailVerification] Form submitted during signup:", formSubmittedDuringSignup);
    console.log("[useEmailVerification] Force retry flag:", forceRetry);
    console.log("[useEmailVerification] Submission error:", submissionError);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useEmailVerification] Auth state change:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          console.log("[useEmailVerification] Email confirmed, user is verified");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages if we already displayed them elsewhere
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard shortly after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[useEmailVerification] Token refreshed, checking email verification status");
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    });
    
    // Check if user is already verified on mount
    if (user?.email_confirmed_at || user?.confirmed_at) {
      console.log("[useEmailVerification] User already verified on mount");
      setVerificationStatus('verified');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    // Check session every 5 seconds to detect email verification
    const checkInterval = setInterval(async () => {
      if (verificationStatus === 'verified') return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email_confirmed_at || data.session?.user?.confirmed_at) {
          console.log("[useEmailVerification] Email verified detected in interval check");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error("[useEmailVerification] Error checking session:", error);
      }
    }, 5000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    }
  }, [navigate, user, processingSubmission, submissionCompleted, verificationStatus, formSubmittedDuringSignup, redirecting]);

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
