
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { AssessmentResult } from './types/assessmentTypes';
import ResultHeader from './components/ResultHeader';
import ResultStatusHeader from './components/ResultStatusHeader';
import RecommendationsList from './components/RecommendationsList';
import DisclaimerNote from './components/DisclaimerNote';
import ResultActions from './components/ResultActions';
import ConsultationBooking from '@/components/success/ConsultationBooking';

interface AssessmentResultsProps {
  result: AssessmentResult;
  onBack: () => void;
  onRestart: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ result, onBack, onRestart }) => {
  const getStatusColor = () => {
    switch (result.status) {
      case 'likely-resident': return 'red';
      case 'likely-non-resident': return 'green';
      case 'continue-assess': return 'amber';
      default: return 'gray';
    }
  };

  const color = getStatusColor();
  const bgColor = `bg-${color}-50`;
  const borderColor = `border-${color}-100`;

  return (
    <div className="space-y-6">
      <ResultHeader onBack={onBack} />

      <Card className="shadow-sm">
        <CardHeader className={`${bgColor} border-b ${borderColor}`}>
          <ResultStatusHeader status={result.status} strength={result.strength} />
        </CardHeader>
        <CardContent className="pt-6">
          <RecommendationsList recommendations={result.recommendations} />
          <DisclaimerNote />
        </CardContent>
        <CardFooter>
          <ResultActions onRestart={onRestart} />
        </CardFooter>
      </Card>
      
      {/* Add consultation booking component */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Speak With a Tax Professional</h2>
        <p className="text-gray-600 mb-6">
          For personalized advice about your tax residency status and obligations, 
          schedule a consultation with one of our expert tax advisors.
        </p>
        <ConsultationBooking />
      </div>
    </div>
  );
};

export default AssessmentResults;
