
export type AssessmentResultStatus = 'likely-resident' | 'likely-non-resident' | 'continue-assess';

export type AssessmentStepOption = {
  id: string;
  label: string;
  description?: string;
  nextStep?: string;
  resultStrength?: number;
  resultStatus?: AssessmentResultStatus;
};

export type AssessmentStep = {
  id: string;
  question: string;
  description?: string;
  options: AssessmentStepOption[];
};

export type AssessmentResult = {
  status: AssessmentResultStatus;
  strength: number;
  recommendations: string[];
};
