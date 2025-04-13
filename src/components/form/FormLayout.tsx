
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import WelcomeStep from './steps/WelcomeStep';
import OwnerStep from './steps/OwnerStep';
import PropertyStep from './steps/PropertyStep';
import AssignmentStep from './steps/AssignmentStep';
import ReviewStep from './steps/ReviewStep';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 0, name: 'Welcome' },
  { id: 1, name: 'Owners' },
  { id: 2, name: 'Properties' },
  { id: 3, name: 'Assignments' },
  { id: 4, name: 'Review' }
];

const FormLayout: React.FC = () => {
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
        return <ReviewStep />;
      default:
        return <WelcomeStep />;
    }
  };

  const progressPercent = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Progress Stepper */}
            <div className="p-6 bg-form-100 border-b">
              <div className="flex justify-between mb-2 relative">
                {STEPS.map((step) => (
                  <div 
                    key={step.id} 
                    className="flex flex-col items-center relative z-10 flex-1"
                    style={{ 
                      // Ensure even spacing
                      width: `${100 / (STEPS.length - 1)}%`,
                      maxWidth: `${100 / (STEPS.length - 1)}%`
                    }}
                  >
                    <button 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                        step.id === currentStep 
                          ? "bg-form-300 text-white border-form-300 shadow-md" 
                          : step.id < currentStep 
                            ? "bg-green-500 text-white border-green-500 shadow-sm" 
                            : "bg-white text-gray-400 border-gray-200"
                      )}
                      onClick={() => {
                        // Allow navigation to previous steps, but don't skip ahead
                        if (step.id <= currentStep) {
                          goToStep(step.id);
                        }
                      }}
                      disabled={step.id > currentStep}
                    >
                      {step.id < currentStep ? <Check className="h-5 w-5" /> : step.id + 1}
                    </button>
                    <span className={cn(
                      "text-xs mt-2 font-medium transition-colors duration-300 text-center w-full",
                      step.id === currentStep 
                        ? "text-form-400" 
                        : step.id < currentStep 
                          ? "text-green-600" 
                          : "text-gray-400"
                    )}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="relative mt-4 pt-2">
                <Progress 
                  value={progressPercent} 
                  className="h-1 bg-transparent"
                  indicatorClassName={cn(
                    "bg-gradient-to-r from-form-300 to-green-500 transition-all duration-500"
                  )}
                />
                
                {/* Step indicators on progress bar */}
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
                  {STEPS.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const position = `${(index / (STEPS.length - 1)) * 100}%`;
                    
                    return (
                      <div 
                        key={step.id}
                        className={cn(
                          "w-3 h-3 rounded-full -mt-1 border-2 transition-all duration-300 absolute",
                          isCompleted 
                            ? "bg-green-500 border-green-500" 
                            : isCurrent 
                              ? "bg-form-300 border-form-300" 
                              : "bg-white border-gray-300"
                        )}
                        style={{ 
                          left: position, 
                          transform: 'translateX(-50%)'
                        }}
                      />
                    );
                  })}
                </div>
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
