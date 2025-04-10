
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import WelcomeStep from './steps/WelcomeStep';
import OwnerStep from './steps/OwnerStep';
import PropertyStep from './steps/PropertyStep';
import AssignmentStep from './steps/AssignmentStep';
import ReviewStep from './steps/ReviewStep';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 0, name: 'Welcome' },
  { id: 1, name: 'Owners' },
  { id: 2, name: 'Properties' },
  { id: 3, name: 'Assignments' },
  { id: 4, name: 'Review' }
];

interface FormLayoutProps {
  onSubmitAttempt?: () => void;
  isUserSignedUp?: boolean;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  onSubmitAttempt,
  isUserSignedUp = false
}) => {
  const { state, goToStep } = useFormContext();
  const { currentStep } = state;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <OwnerStep />;
      case 2:
        return <PropertyStep />;
      case 3:
        return <AssignmentStep />;
      case 4:
        return <ReviewStep onSubmitAttempt={onSubmitAttempt} isUserSignedUp={isUserSignedUp} />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Progress Stepper */}
            <div className="p-4 bg-form-100 border-b">
              <div className="flex justify-between">
                {STEPS.map((step) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <button 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        step.id === currentStep 
                          ? "bg-form-300 text-white" 
                          : step.id < currentStep 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 text-gray-500"
                      )}
                      onClick={() => {
                        // Allow navigation to previous steps, but don't skip ahead
                        if (step.id <= currentStep) {
                          goToStep(step.id);
                        }
                      }}
                      disabled={step.id > currentStep}
                    >
                      {step.id < currentStep ? '✓' : step.id + 1}
                    </button>
                    <span className="text-xs mt-1 hidden sm:block">{step.name}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-form-300 -translate-y-1/2 transition-all" 
                  style={{ width: `${(currentStep) * 25}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
