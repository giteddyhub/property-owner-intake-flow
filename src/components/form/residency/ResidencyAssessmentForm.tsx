
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Home, HelpCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, CardRadioGroupItem } from '@/components/ui/radio-group';
import AssessmentResults from './AssessmentResults';

type AssessmentStep = {
  id: string;
  question: string;
  description?: string;
  options: {
    id: string;
    label: string;
    nextStep?: string;
    resultStrength?: number;
    resultStatus?: 'likely-resident' | 'likely-non-resident' | 'continue-assess';
  }[];
};

const assessmentSteps: Record<string, AssessmentStep> = {
  start: {
    id: 'start',
    question: 'Are you registered for residency in Italy?',
    description: 'This means you are officially registered with the local "Comune" (municipality) in Italy.',
    options: [
      { 
        id: 'yes', 
        label: 'Yes',
        nextStep: 'when-registered' 
      },
      { 
        id: 'no', 
        label: 'No',
        nextStep: 'spent-183-days' 
      },
      { 
        id: 'dont-know', 
        label: 'I don\'t know',
        nextStep: 'info-registry-office'
      }
    ]
  },
  'info-registry-office': {
    id: 'info-registry-office',
    question: 'Information about Registry Office Registration',
    description: 'Being registered at the Italian Registry Office (Anagrafe) means you have officially established your residency in an Italian municipality (Comune). This is a formal procedure where you declare that you permanently live at an address in Italy. When you register, you receive a certificate of residency, which is an official document that confirms your status as a resident.',
    options: [
      {
        id: 'yes-registered',
        label: 'Yes, I am registered',
        nextStep: 'when-registered',
      },
      {
        id: 'no-not-registered',
        label: 'No, I am not registered',
        nextStep: 'spent-183-days',
      },
      {
        id: 'still-not-sure',
        label: 'I\'m still not sure',
        nextStep: 'spent-183-days',
      }
    ]
  },
  'when-registered': {
    id: 'when-registered',
    question: 'When did you apply?',
    description: 'Your registration date affects your tax residency status.',
    options: [
      {
        id: 'registered-over-183',
        label: 'I\'ve been registered for the majority of the tax period (over 183 days this year)',
        resultStrength: 1,
        resultStatus: 'likely-resident',
      },
      {
        id: 'registered-less-183',
        label: 'I\'ve been registered for less than 183 days this year',
        nextStep: 'civil-union',
      }
    ]
  },
  'spent-183-days': {
    id: 'spent-183-days',
    question: 'Have you spent more than 183 days in Italy?',
    description: 'The 183-day rule is one of the key criteria used to determine tax residency in Italy.',
    options: [
      {
        id: 'yes-over-183',
        label: 'Yes',
        nextStep: 'civil-union',
      },
      {
        id: 'no-under-183',
        label: 'No',
        nextStep: 'civil-union-2',
      }
    ]
  },
  'civil-union': {
    id: 'civil-union',
    question: 'Are you married or in a civil union and/or do you have children?',
    options: [
      {
        id: 'yes-family',
        label: 'Yes',
        nextStep: 'spouse-children-italy',
      },
      {
        id: 'no-no-family',
        label: 'No',
        resultStrength: 2,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'civil-union-2': {
    id: 'civil-union-2',
    question: 'Are you married or in a civil union and/or do you have children?',
    options: [
      {
        id: 'yes-family-2',
        label: 'Yes',
        nextStep: 'spouse-children-italy-2',
      },
      {
        id: 'no-no-family-2',
        label: 'No',
        resultStrength: 5,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'spouse-children-italy': {
    id: 'spouse-children-italy',
    question: 'Have you had a spouse and/or children in Italy for the majority of the tax year?',
    options: [
      {
        id: 'yes-family-italy',
        label: 'Yes',
        resultStrength: 1,
        resultStatus: 'likely-resident',
      },
      {
        id: 'no-family-not-italy',
        label: 'No',
        resultStrength: 2,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'spouse-children-italy-2': {
    id: 'spouse-children-italy-2',
    question: 'Have you had a spouse and/or children in Italy for the majority of the tax year?',
    options: [
      {
        id: 'yes-family-italy-2',
        label: 'Yes',
        resultStrength: 3,
        resultStatus: 'continue-assess',
      },
      {
        id: 'no-family-not-italy-2',
        label: 'No',
        resultStrength: 4,
        resultStatus: 'continue-assess',
      }
    ]
  },
};

type AssessmentResult = {
  status: 'likely-resident' | 'likely-non-resident' | 'continue-assess';
  strength: number;
  recommendations: string[];
};

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

    // Save the selected option
    setSelectedOptions(prev => ({
      ...prev,
      [currentStep.id]: optionId
    }));

    // If this option leads to a result, set the result
    if (option.resultStatus) {
      let recommendations: string[] = [];
      
      if (option.resultStatus === 'likely-resident') {
        recommendations = [
          "You likely qualify as an Italian tax resident",
          "You should consult with a tax professional to understand your obligations",
          "Italian residents must declare worldwide income to Italian tax authorities"
        ];
      } else if (option.resultStatus === 'likely-non-resident') {
        recommendations = [
          "Based on your answers, you likely do not qualify as an Italian tax resident",
          "Non-residents are typically only taxed on income from Italian sources",
          "Consider consulting with a tax professional to confirm your status"
        ];
      } else if (option.resultStatus === 'continue-assess') {
        recommendations = [
          "Your situation requires a more detailed analysis",
          "We recommend consulting with a tax professional about your specific case",
          "Consider factors like where your main economic interests are located"
        ];
      }
      
      setResult({
        status: option.resultStatus,
        strength: option.resultStrength || 3,
        recommendations
      });
      return;
    }

    // If this option leads to another step, update the current step
    if (option.nextStep) {
      setStepHistory(prev => [...prev, currentStepId]);
      setCurrentStepId(option.nextStep);
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

      <div className="bg-gray-100 h-2 rounded-full mb-8">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${(Object.keys(selectedOptions).length / 5) * 100}%` }}
        />
      </div>

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
            value={selectedOptions[currentStep.id] || ''}
            onValueChange={handleOptionSelect}
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
          {selectedOptions[currentStep.id] && !currentStep.options.find(o => o.id === selectedOptions[currentStep.id])?.resultStatus && (
            <Button 
              onClick={() => {
                const selectedOption = currentStep.options.find(o => o.id === selectedOptions[currentStep.id]);
                if (selectedOption?.nextStep) {
                  setStepHistory(prev => [...prev, currentStep.id]);
                  setCurrentStepId(selectedOption.nextStep);
                }
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResidencyAssessmentForm;
