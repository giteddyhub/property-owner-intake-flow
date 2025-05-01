
import React from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { useReviewStepContext } from './context/ReviewStepContext';
import SubmissionSection from './sections/SubmissionSection';
import OwnersSection from './sections/OwnersSection';
import PropertiesSection from './sections/PropertiesSection';
import AssignmentsSection from './sections/AssignmentsSection';
import ReviewActions from '@/components/form/review/ReviewActions';

interface ReviewStepContentProps {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  goToStep: (step: number) => void;
  prevStep: () => void;
}

const ReviewStepContent: React.FC<ReviewStepContentProps> = ({
  owners,
  properties,
  assignments,
  goToStep,
  prevStep
}) => {
  const { 
    isSubmitting, 
    showAuthModal, 
    setShowAuthModal,
    submissionInProgress,
    handleSubmitButtonClick,
    handleAuthSuccess 
  } = useReviewStepContext();
  
  return (
    <>
      {isSubmitting && <LoadingOverlay message="Submitting your information..." />}
      
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Submit</h2>
      
      <p className="mb-6 text-gray-600">
        Please review all the information below before submitting. You can go back to make changes if needed.
      </p>
      
      <SubmissionSection 
        owners={owners}
        properties={properties}
        assignments={assignments}
      />
      
      <OwnersSection 
        owners={owners}
        onEditClick={() => goToStep(1)}
      />
      
      <PropertiesSection 
        properties={properties}
        onEditClick={() => goToStep(2)}
      />
      
      <AssignmentsSection 
        properties={properties}
        owners={owners}
        assignments={assignments}
        onEditClick={() => goToStep(3)}
      />
      
      <ReviewActions 
        prevStep={prevStep}
        onSubmitButtonClick={handleSubmitButtonClick}
        isSubmitting={isSubmitting || submissionInProgress}
        owners={owners}
        properties={properties}
        assignments={assignments}
      />
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
        title="Create an Account to Submit"
        description="Creating an account allows you to access your submission later and receive updates."
        defaultTab="sign-up"
      />
    </>
  );
};

export default ReviewStepContent;
