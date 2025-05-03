
import React, { useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTaxFilingState } from '@/hooks/useTaxFilingState';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

interface TaxFilingCTAProps {
  userId: string;
}

export const TaxFilingCTA: React.FC<TaxFilingCTAProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTaxFilingSession, loading } = useTaxFilingState();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleGetTaxFilings = async () => {
    try {
      setIsProcessing(true);
      
      if (!userId || !user) {
        toast.error('You need to be signed in to access tax filing services');
        navigate('/login');
        return;
      }
      
      toast.info('Preparing your tax filing service...');
      
      // Add a delay to allow the toast to show before potentially showing error messages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessionId = await createTaxFilingSession(userId);
      
      if (!sessionId) {
        console.error('Failed to obtain a valid session ID');
        toast.error('Unable to start tax filing service. Please try again later.');
        return;
      }
      
      // Add a small delay to prevent multiple navigation attempts
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the tax filing service page
      navigate(`/tax-filing-service/${sessionId}`);
    } catch (error) {
      console.error('Error navigating to tax filing service:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
            disabled={isProcessing || loading}
          >
            {(isProcessing || loading) ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
