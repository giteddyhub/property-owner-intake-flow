
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import WelcomeStep from './steps/WelcomeStep';
import OwnerStep from './steps/OwnerStep';
import PropertyStep from './steps/PropertyStep';
import AssignmentStep from './steps/AssignmentStep';
import ReviewStep from './steps/ReviewStep';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 0, name: 'Welcome', description: 'Get started' },
  { id: 1, name: 'Owners', description: 'Add property owners' },
  { id: 2, name: 'Properties', description: 'Add your properties' },
  { id: 3, name: 'Assignments', description: 'Assign properties' },
  { id: 4, name: 'Review', description: 'Complete submission' }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Progress Stepper */}
            <div className="p-6 bg-white border-b">
              <div className="w-full max-w-3xl mx-auto px-4 md:px-8">
                {/* New Progress Stepper */}
                <div className="relative">
                  {/* Progress Line - Extended Edge to Edge */}
                  <div className="absolute top-5 left-0 right-0 w-full h-[2px]">
                    <div className="w-full h-full bg-gray-200"></div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#9b87f5] transition-all duration-500 ease-in-out"
                      style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Steps */}
                  <div className="flex justify-between relative">
                    {STEPS.map((step, index) => {
                      const isCompleted = step.id < currentStep;
                      const isCurrent = step.id === currentStep;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          {/* Circle Indicator */}
                          <button
                            onClick={() => {
                              if (step.id <= currentStep) {
                                goToStep(step.id);
                              }
                            }}
                            disabled={step.id > currentStep}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                              isCompleted 
                                ? "bg-[#9b87f5] text-white border-2 border-[#9b87f5]" 
                                : isCurrent 
                                  ? "bg-white border-4 border-[#9b87f5] ring-2 ring-[#E5DEFF]" 
                                  : "bg-white border-2 border-gray-200"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-5 w-5" />
                            ) : isCurrent ? (
                              <div className="w-2 h-2 bg-[#9b87f5] rounded-full"></div>
                            ) : (
                              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                            )}
                          </button>

                          {/* Step Title */}
                          <span 
                            className={cn(
                              "mt-3 font-medium text-sm",
                              isCompleted 
                                ? "text-[#9b87f5]" 
                                : isCurrent 
                                  ? "text-[#7E69AB]" 
                                  : "text-gray-400"
                            )}
                          >
                            {step.name}
                          </span>
                          
                          {/* Step Description */}
                          <span 
                            className={cn(
                              "text-xs mt-1 text-center max-w-[120px]",
                              isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                            )}
                          >
                            {step.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
