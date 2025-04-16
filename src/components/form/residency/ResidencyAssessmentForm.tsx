
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssessmentResults from './AssessmentResults';
import ProgressBar from './components/ProgressBar';
import StepQuestion from './components/StepQuestion';
import assessmentSteps from './data/assessmentSteps';
import { createAssessmentResult } from './utils/resultUtils';
import { AssessmentResult } from './types/assessmentTypes';

interface ResidencyAssessmentFormProps {
  onBack: () => void;
}

const ResidencyAssessmentForm: React.FC<ResidencyAssessmentFormProps> = ({ onBack }) => {
  const [currentStepId, setCurrentStepId] = useState<string>('start');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  
  const currentStep = assessmentSteps[currentStepId];

  const handleOptionSelect = (optionId: string) => {
    const option = currentStep.options.find(opt => opt.id === optionId);
    if (!option) return;

    setSelectedOptions(prev => ({
      ...prev,
      [currentStep.id]: optionId
    }));

    if (option.resultStatus) {
      setResult(createAssessmentResult(
        option.resultStatus,
        option.resultStrength || 3
      ));
      return;
    }

    // No need to continue automatically since we have a continue button
  };

  const handleContinue = () => {
    const selectedOption = currentStep.options.find(
      o => o.id === selectedOptions[currentStep.id]
    );
    
    if (selectedOption?.nextStep) {
      setStepHistory(prev => [...prev, currentStepId]);
      setCurrentStepId(selectedOption.nextStep);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      return;
    }
    
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setCurrentStepId(previousStep);
    } else {
      onBack();
    }
  };

  const handleRestart = () => {
    setCurrentStepId('start');
    setSelectedOptions({});
    setResult(null);
    setStepHistory([]);
  };

  if (result) {
    return (
      <AssessmentResults 
        result={result}
        onBack={handleBack}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Residency Assessment</h1>
      </div>

      <ProgressBar 
        progress={Object.keys(selectedOptions).length} 
        total={5} 
      />

      <StepQuestion 
        currentStep={currentStep}
        selectedOption={selectedOptions[currentStep.id]}
        onOptionSelect={handleOptionSelect}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default ResidencyAssessmentForm;
