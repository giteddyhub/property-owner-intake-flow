
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { AssessmentResult } from './types/assessmentTypes';
import ResultHeader from './components/ResultHeader';
import ResultStatusHeader from './components/ResultStatusHeader';
import RecommendationsList from './components/RecommendationsList';
import DisclaimerNote from './components/DisclaimerNote';
import ResultActions from './components/ResultActions';

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
    </div>
  );
};

export default AssessmentResults;
