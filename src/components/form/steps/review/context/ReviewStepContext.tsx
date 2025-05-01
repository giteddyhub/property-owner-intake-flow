import React, { createContext, useContext, useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
    
    console.log("ReviewStep handleSubmitButtonClick");
    
    // Store form data in sessionStorage so we can access it post-authentication
    // This data will now be submitted immediately after signup
    sessionStorage.setItem('pendingFormData', JSON.stringify({
      owners,
      properties,
      assignments,
      contactInfo: {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      }
    }));
    
    if (!user) {
      // If not logged in, show auth modal
      setShowAuthModal(true);
    } else {
      // If logged in, proceed with submission directly
      handleSubmit();
    }
  };
  
  const handleAuthSuccess = () => {
    // Close the auth modal
    setShowAuthModal(false);
    
    // Mark that we've attempted submission from this component
    setSubmissionAttempted(true);
  };
  
  const handleSubmit = async () => {
    // Import dynamically to avoid circular dependencies
    const { submitFormData } = await import('@/components/form/review/utils/submissionService');
    
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
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
      
      // Pass the user ID to submitFormData so data can be properly associated
      await submitFormData(owners, properties, assignments, contactInfo, user?.id || null);
      
      // Clear form data to prevent duplicate submissions
      sessionStorage.removeItem('pendingFormData');
      
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error('There was an error submitting your information. Please try again.');
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
