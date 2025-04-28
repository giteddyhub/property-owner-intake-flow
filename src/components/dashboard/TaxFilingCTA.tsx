
import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTaxFilingState } from '@/hooks/useTaxFilingState';

interface TaxFilingCTAProps {
  userId: string;
}

export const TaxFilingCTA: React.FC<TaxFilingCTAProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { createTaxFilingSession } = useTaxFilingState();
  
  const handleGetTaxFilings = async () => {
    const sessionId = await createTaxFilingSession(userId);
    navigate(`/tax-filing-service/${sessionId}`);
  };
  
  return (
    <Card className="border-0 shadow-sm bg-amber-50 border-amber-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-amber-800 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Tax Filing Service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-full">
          <div>
            <div className="text-lg font-medium">Complete your tax filings</div>
            <p className="text-sm text-amber-700 mt-1 mb-4">
              Let our experts handle your Italian property taxes
            </p>
          </div>
          <Button 
            onClick={handleGetTaxFilings}
            className="bg-amber-500 hover:bg-amber-600 text-white w-full mt-auto"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
