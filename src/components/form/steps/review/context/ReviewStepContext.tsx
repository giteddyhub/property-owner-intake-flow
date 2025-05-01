
import React, { createContext, useContext, useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { submitFormData } from '@/components/form/review/submitUtils';
import { useNavigate } from 'react-router-dom';

type ReviewStepContextType = {
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

const ReviewStepContext = createContext<ReviewStepContextType | undefined>(undefined);

export const useReviewStepContext = () => {
  const context = useContext(ReviewStepContext);
  if (!context) {
    throw new Error('useReviewStepContext must be used within a ReviewStepProvider');
  }
  return context;
};

interface ReviewStepProviderProps {
  children: React.ReactNode;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

export const ReviewStepProvider: React.FC<ReviewStepProviderProps> = ({
  children,
  owners,
  properties,
  assignments
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const { user, processingSubmission, setProcessingSubmission, submissionCompleted } = useAuth();
  const navigate = useNavigate();

  const storeFormDataInSession = () => {
    // Store form data in sessionStorage so we can access it post-authentication
    const pendingFormData = {
      owners,
      properties,
      assignments,
      contactInfo: {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      }
    };
    
    // Validate data before storing
    if (!Array.isArray(owners) || !Array.isArray(properties) || !Array.isArray(assignments)) {
      toast.error("Invalid form data. Please try again.");
      console.error("[ReviewStepContext] Invalid form data structure:", { owners, properties, assignments });
      return false;
    }
    
    console.log("[ReviewStepContext] Storing pending form data with counts:", {
      owners: owners.length,
      properties: properties.length,
      assignments: assignments.length
    });
    
    // Store the pending form data
    sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
    return true;
  };

  const handleSubmitButtonClick = () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    console.log("[ReviewStepContext] handleSubmitButtonClick with user:", user?.id || "not logged in");
    
    // Clear any previous submission flags to start fresh
    sessionStorage.removeItem('formSubmittedDuringSignup');
    sessionStorage.removeItem('forceRetrySubmission');
    
    // Store form data in session storage
    if (!storeFormDataInSession()) {
      return;
    }
    
    if (!user) {
      console.log("[ReviewStepContext] User not logged in, showing auth modal");
      // If not logged in, show auth modal and set flag to submit after verification
      sessionStorage.setItem('submitAfterVerification', 'true');
      sessionStorage.setItem('redirectToDashboard', 'true');
      setShowAuthModal(true);
    } else {
      console.log("[ReviewStepContext] User is logged in, checking verification status");
      // Check if the user's email is verified
      if (user.email_confirmed_at || user.confirmed_at) {
        console.log("[ReviewStepContext] User email verified, proceeding with direct submission");
        // If logged in and verified, proceed with submission directly
        handleSubmit();
      } else {
        console.log("[ReviewStepContext] User email not verified, redirecting to verification page");
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
      }
    }
  };
  
  const handleAuthSuccess = () => {
    // Close the auth modal
    setShowAuthModal(false);
    
    // Mark that we've attempted submission from this component
    setSubmissionAttempted(true);
    
    // No need to handle submission here - it will be handled by AuthContext
    console.log("[ReviewStepContext] Auth success, submission will be handled by AuthContext");
    
    // Ensure the submitAfterVerification flag is set
    sessionStorage.setItem('submitAfterVerification', 'true');
  };
  
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    console.log("[ReviewStepContext] handleSubmit with user:", user?.id || "not logged in");
    
    if (!user) {
      toast.error("You must be logged in to submit your information");
      setShowAuthModal(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setProcessingSubmission(true);
      setSubmissionInProgress(true);
      setSubmissionAttempted(true);
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };
      
      console.log("[ReviewStepContext] Submitting form data with user ID:", user.id);
      
      // Pass the user ID explicitly to ensure it's associated with the submission
      const result = await submitFormData(owners, properties, assignments, contactInfo, user.id);
      
      if (!result.success) {
        throw new Error(result.error || "Unknown submission error");
      }
      
      // Clear form data to prevent duplicate submissions
      sessionStorage.removeItem('pendingFormData');
      sessionStorage.removeItem('submitAfterVerification');
      sessionStorage.removeItem('redirectToDashboard');
      sessionStorage.setItem('formSubmittedDuringSignup', 'true');
      
      // Notify user of success
      toast.success("Your information has been submitted successfully!");
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error("[ReviewStepContext] Error during submission:", error);
      toast.error(error.message || 'There was an error submitting your information. Please try again.');
      
      // If the error is related to authorization, we might need to redirect to verification
      if (error.message?.includes('Authorization error') || 
          error.message?.includes('violates row-level security policy')) {
        
        toast.info("You may need to verify your email. Redirecting to verification page...");
        sessionStorage.setItem('submitAfterVerification', 'true');
        
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
      setProcessingSubmission(false);
      setSubmissionInProgress(false);
    }
  };

  return (
    <ReviewStepContext.Provider
      value={{
        isSubmitting,
        setIsSubmitting,
        showAuthModal,
        setShowAuthModal,
        submissionInProgress,
        setSubmissionInProgress,
        submissionAttempted,
        setSubmissionAttempted,
        handleSubmitButtonClick,
        handleAuthSuccess
      }}
    >
      {children}
      {showAuthModal && (
        <AuthModal 
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab="sign-up"
          onSuccess={handleAuthSuccess}
          redirectAfterAuth={true}
        />
      )}
    </ReviewStepContext.Provider>
  );
};
