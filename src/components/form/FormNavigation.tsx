
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/contexts/FormContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  onNext?: () => boolean; // Return true to proceed, false to stop
  submitText?: string;
  showBack?: boolean;
  showNext?: boolean;
  onCancel?: () => void; // Added for form cancellation
  cancelText?: string; // Added for custom cancel text
  onSubmit?: () => void; // Added for form submission
  submitButtonText?: string; // Added for custom submit button text
  isFormMode?: boolean; // Added to determine if we're in a form editing mode
  hideCancel?: boolean; // Added to hide cancel button in specific cases
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  onNext,
  submitText = 'Submit',
  showBack = true,
  showNext = true,
  onCancel,
  cancelText = 'Cancel',
  onSubmit,
  submitButtonText = 'Save',
  isFormMode = false,
  hideCancel = false,
}) => {
  const { state, nextStep, prevStep } = useFormContext();
  const { currentStep } = state;
  const isLastStep = currentStep === 4;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (onNext) {
      const canProceed = onNext();
      if (!canProceed) return;
    }
    nextStep();
    scrollToTop();
  };

  const handlePrev = () => {
    prevStep();
    scrollToTop();
  };

  // If we're in form mode, render a cancel and submit button pair
  if (isFormMode) {
    return (
      <div className="flex justify-between mt-8">
        {onCancel && !hideCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {cancelText}
          </Button>
        )}
        
        {onSubmit && (
          <Button 
            type="button" 
            onClick={onSubmit}
            className="bg-form-300 hover:bg-form-400 text-white flex items-center gap-2"
            style={{marginLeft: hideCancel ? 'auto' : undefined}}
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    );
  }

  // Standard navigation mode
  return (
    <div className="flex justify-between mt-8">
      {showBack && currentStep > 0 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div></div>
      )}
      
      {showNext && (
        <Button 
          type="button" 
          onClick={handleNext}
          className="bg-form-300 hover:bg-form-400 text-white flex items-center gap-2"
        >
          {isLastStep ? submitText : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
