
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, CardRadioGroupItem } from '@/components/ui/radio-group';
import { AssessmentStep } from '../types/assessmentTypes';

interface StepQuestionProps {
  currentStep: AssessmentStep;
  selectedOption: string | undefined;
  onOptionSelect: (optionId: string) => void;
  onContinue: () => void;
}

const StepQuestion: React.FC<StepQuestionProps> = ({
  currentStep,
  selectedOption,
  onOptionSelect,
  onContinue
}) => {
  const canContinue = selectedOption && 
    !currentStep.options.find(o => o.id === selectedOption)?.resultStatus;

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-purple-50 border-b border-purple-100">
        <CardTitle className="text-xl text-purple-900">{currentStep.question}</CardTitle>
        {currentStep.description && (
          <CardDescription className="text-purple-700 mt-2">
            {currentStep.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={onOptionSelect}
        >
          <div className="space-y-3">
            {currentStep.options.map((option) => (
              <CardRadioGroupItem
                key={option.id}
                value={option.id}
                title={option.label}
              >
                {option.description && <p>{option.description}</p>}
              </CardRadioGroupItem>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-sm text-gray-500">
          Your answers are not stored and are only used to provide guidance.
        </div>
        {canContinue && (
          <Button onClick={onContinue}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StepQuestion;
