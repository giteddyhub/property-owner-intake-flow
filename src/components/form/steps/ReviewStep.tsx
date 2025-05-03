
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { ReviewStepContent, ReviewStepProvider } from './review';

// Create unique ID for this component instance
const REVIEW_STEP_INSTANCE_ID = Date.now().toString();

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const { processingSubmission } = useAuth();
  
  console.log(`ReviewStep [${REVIEW_STEP_INSTANCE_ID}] render: processingSubmission=${processingSubmission}`);
  
  return (
    <ReviewStepProvider 
      owners={owners}
      properties={properties}
      assignments={assignments}
    >
      <ReviewStepContent
        owners={owners}
        properties={properties}
        assignments={assignments}
        goToStep={goToStep}
        prevStep={prevStep}
      />
    </ReviewStepProvider>
  );
};

export default ReviewStep;
