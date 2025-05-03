import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useAuthFlow = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Close the auth modal
    setShowAuthModal(false);
    
    // Mark that we've attempted submission from this component
    
    // No need to handle submission here - it will be handled by AuthContext
    console.log("[useAuthFlow] Auth success, submission will be handled by AuthContext");
    
    // Ensure the submitAfterVerification flag is set
    sessionStorage.setItem('submitAfterVerification', 'true');
  };

  const initiateAuthFlow = () => {
    console.log("[useAuthFlow] initiateAuthFlow with user:", user?.id || "not logged in");
    
    // Clear any previous submission flags to start fresh
    sessionStorage.removeItem('formSubmittedDuringSignup');
    sessionStorage.removeItem('forceRetrySubmission');
    
    if (!user) {
      console.log("[useAuthFlow] User not logged in, showing auth modal");
      // If not logged in, show auth modal and set flag to submit after verification
      sessionStorage.setItem('submitAfterVerification', 'true');
      sessionStorage.setItem('redirectToDashboard', 'true');
      setShowAuthModal(true);
    } else {
      console.log("[useAuthFlow] User is logged in, checking verification status");
      // Check if the user's email is verified
      if (user.email_confirmed_at || user.confirmed_at) {
        console.log("[useAuthFlow] User email verified, proceeding with direct submission");
        // If logged in and verified, return true to indicate we should proceed with submission
        return true;
      } else {
        console.log("[useAuthFlow] User email not verified, redirecting to verification page");
        // If not verified, redirect to verify email page
        sessionStorage.setItem('submitAfterVerification', 'true');
        sessionStorage.setItem('redirectToDashboard', 'true');
        toast.warning("You need to verify your email before submitting data", {
          description: "Redirecting to verification page..."
        });
        // Use navigate for a more controlled redirect
        setTimeout(() => {
          navigate('/verify-email');
        }, 1500);
        return false;
      }
    }
    
    // Default return for when auth modal is shown
    return false;
  };

  return {
    showAuthModal,
    setShowAuthModal,
    handleAuthSuccess,
    initiateAuthFlow
  };
};
