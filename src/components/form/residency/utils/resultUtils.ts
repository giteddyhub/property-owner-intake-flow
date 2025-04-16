
import { AssessmentResult, AssessmentResultStatus } from '../types/assessmentTypes';

export const generateRecommendations = (status: AssessmentResultStatus): string[] => {
  switch (status) {
    case 'likely-resident':
      return [
        "You likely qualify as an Italian tax resident",
        "You should consult with a tax professional to understand your obligations",
        "Italian residents must declare worldwide income to Italian tax authorities"
      ];
    case 'likely-non-resident':
      return [
        "Based on your answers, you likely do not qualify as an Italian tax resident",
        "Non-residents are typically only taxed on income from Italian sources",
        "Consider consulting with a tax professional to confirm your status"
      ];
    case 'continue-assess':
      return [
        "Your situation requires a more detailed analysis",
        "We recommend consulting with a tax professional about your specific case",
        "Consider factors like where your main economic interests are located"
      ];
    default:
      return [];
  }
};

export const createAssessmentResult = (
  status: AssessmentResultStatus, 
  strength: number
): AssessmentResult => {
  return {
    status,
    strength,
    recommendations: generateRecommendations(status)
  };
};
