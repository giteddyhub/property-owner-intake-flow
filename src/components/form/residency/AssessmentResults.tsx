
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

type AssessmentResult = {
  status: 'likely-resident' | 'likely-non-resident' | 'continue-assess';
  strength: number;
  recommendations: string[];
};

interface AssessmentResultsProps {
  result: AssessmentResult;
  onBack: () => void;
  onRestart: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ result, onBack, onRestart }) => {
  const getStatusDetails = () => {
    switch (result.status) {
      case 'likely-resident':
        return {
          icon: <CheckCircle2 className="h-12 w-12 text-red-500" />,
          title: 'Likely a Tax Resident',
          description: 'Based on your answers, you are likely to be considered a tax resident in Italy.',
          color: 'red',
          strengthLabel: `Confidence Level: ${result.strength === 1 ? 'Very High' : 'High'}`
        };
      case 'likely-non-resident':
        return {
          icon: <XCircle className="h-12 w-12 text-green-500" />,
          title: 'Likely Not a Tax Resident',
          description: 'Based on your answers, you are likely not considered a tax resident in Italy.',
          color: 'green',
          strengthLabel: `Confidence Level: ${result.strength >= 4 ? 'Very High' : result.strength >= 3 ? 'High' : 'Moderate'}`
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

  const { icon, title, description, color, strengthLabel } = getStatusDetails();
  const bgColor = `bg-${color}-50`;
  const borderColor = `border-${color}-100`;
  const textColor = `text-${color}-900`;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className={`${bgColor} border-b ${borderColor}`}>
          <div className="flex items-center gap-4">
            {icon}
            <div>
              <CardTitle className={`text-2xl ${textColor}`}>{title}</CardTitle>
              <CardDescription className="mt-1 text-base">{description}</CardDescription>
              <div className="mt-2 text-sm font-medium">{strengthLabel}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Note</h4>
            <p className="text-blue-800 text-sm">
              This assessment is based on the information you provided and is intended as general guidance only. 
              Tax residency determinations can be complex and depend on your specific circumstances.
              For definitive guidance, consult with a qualified tax professional.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 justify-end">
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Assessment
          </Button>
          <Button onClick={() => window.close()}>
            Return to Form
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentResults;
