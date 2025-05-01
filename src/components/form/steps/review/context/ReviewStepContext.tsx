
import React, { createContext, useContext, useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { submitFormData } from '@/components/form/review/submitUtils';

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

  const handleSubmitButtonClick = () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    console.log("[ReviewStepContext] handleSubmitButtonClick with user:", user?.id || "not logged in");
    
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
    
    sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
    
    if (!user) {
      console.log("[ReviewStepContext] User not logged in, showing auth modal");
      // If not logged in, show auth modal
      setShowAuthModal(true);
    } else {
      console.log("[ReviewStepContext] User is logged in, proceeding with direct submission");
      // If logged in, proceed with submission directly
      handleSubmit();
    }
  };
  
  const handleAuthSuccess = () => {
    // Close the auth modal
    setShowAuthModal(false);
    
    // Mark that we've attempted submission from this component
    setSubmissionAttempted(true);
    
    // No need to handle submission here - it will be handled by AuthContext
    console.log("[ReviewStepContext] Auth success, submission will be handled by AuthContext");
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
      
      // Pass the user ID explicitly to ensure it's associated with the submission
      const result = await submitFormData(owners, properties, assignments, contactInfo, user.id);
      
      if (!result.success) {
        throw new Error(result.error || "Unknown submission error");
      }
      
      // Clear form data to prevent duplicate submissions
      sessionStorage.removeItem('pendingFormData');
      
      // Notify user of success
      toast.success("Your information has been submitted successfully!");
      
    } catch (error: any) {
      console.error("[ReviewStepContext] Error during submission:", error);
      toast.error(error.message || 'There was an error submitting your information. Please try again.');
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
