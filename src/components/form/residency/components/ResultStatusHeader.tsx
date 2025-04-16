
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { AssessmentResultStatus } from '../types/assessmentTypes';

interface ResultStatusHeaderProps {
  status: AssessmentResultStatus;
  strength: number;
}

const ResultStatusHeader: React.FC<ResultStatusHeaderProps> = ({ status, strength }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'likely-resident':
        return {
          icon: <CheckCircle2 className="h-12 w-12 text-red-500" />,
          title: 'Likely a Tax Resident',
          description: 'Based on your answers, you are likely to be considered a tax resident in Italy.',
          color: 'red',
          strengthLabel: `Confidence Level: ${strength === 1 ? 'Very High' : 'High'}`
        };
      case 'likely-non-resident':
        return {
          icon: <XCircle className="h-12 w-12 text-green-500" />,
          title: 'Likely Not a Tax Resident',
          description: 'Based on your answers, you are likely not considered a tax resident in Italy.',
          color: 'green',
          strengthLabel: `Confidence Level: ${strength >= 4 ? 'Very High' : strength >= 3 ? 'High' : 'Moderate'}`
        };
      case 'continue-assess':
        return {
          icon: <AlertCircle className="h-12 w-12 text-amber-500" />,
          title: 'Further Assessment Needed',
          description: 'Your situation is complex and requires further assessment.',
          color: 'amber',
          strengthLabel: `Confidence Level: Moderate`
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-gray-500" />,
          title: 'Assessment Complete',
          description: 'We\'ve analyzed your answers.',
          color: 'gray',
          strengthLabel: ''
        };
    }
  };

  const { icon, title, description, strengthLabel } = getStatusDetails();

  return (
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <CardTitle className={`text-2xl text-${getStatusDetails().color}-900`}>{title}</CardTitle>
        <CardDescription className="mt-1 text-base">{description}</CardDescription>
        <div className="mt-2 text-sm font-medium">{strengthLabel}</div>
      </div>
    </div>
  );
};

export default ResultStatusHeader;
