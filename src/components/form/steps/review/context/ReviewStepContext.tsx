
import React, { createContext, useContext } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useSubmissionHandler } from '../hooks/useSubmissionHandler';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { ReviewStepContextType, ReviewStepProviderProps } from './types';

const ReviewStepContext = createContext<ReviewStepContextType | undefined>(undefined);

export const useReviewStepContext = () => {
  const context = useContext(ReviewStepContext);
  if (!context) {
    throw new Error('useReviewStepContext must be used within a ReviewStepProvider');
  }
  return context;
};

export const ReviewStepProvider: React.FC<ReviewStepProviderProps> = ({
  children,
  owners,
  properties,
  assignments
}) => {
  // Use our extracted hooks
  const {
    isSubmitting,
    setIsSubmitting,
    submissionInProgress,
    setSubmissionInProgress,
    submissionAttempted,
    setSubmissionAttempted,
    handleSubmit,
    storeFormDataInSession
  } = useSubmissionHandler(owners, properties, assignments);
  
  const {
    showAuthModal,
    setShowAuthModal,
    handleAuthSuccess,
    initiateAuthFlow
  } = useAuthFlow();

  const handleSubmitButtonClick = () => {
    // Store form data in session storage
    if (!storeFormDataInSession()) {
      return;
    }
    
    // Check auth flow
    const shouldProceed = initiateAuthFlow();
    if (shouldProceed) {
      // If auth checks pass, proceed with submission
      handleSubmit();
    }
    
    // Set that we've attempted submission
    setSubmissionAttempted(true);
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
