
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationResult {
  paymentId: string;
  status: 'verified' | 'not_paid' | 'error';
  stripeStatus?: string;
  message?: string;
}

interface BatchVerificationResponse {
  message: string;
  verified: number;
  failed: number;
  total: number;
  results: VerificationResult[];
}

export const PaymentVerificationPanel: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<BatchVerificationResponse | null>(null);

  const handleBatchVerification = async () => {
    setIsVerifying(true);
    
    try {
      console.log('Starting batch payment verification...');
      
      const { data, error } = await supabase.functions.invoke('batch-verify-payments', {
        body: {},
      });
      
      if (error) {
        console.error('Batch verification error:', error);
        toast.error(`Verification failed: ${error.message}`);
        return;
      }
      
      setLastResult(data);
      
      if (data.verified > 0) {
        toast.success(`Successfully verified ${data.verified} payment(s)!`);
      } else if (data.total === 0) {
        toast.info('No pending payments found to verify.');
      } else {
        toast.warning(`No payments were verified. Check the results for details.`);
      }
      
      console.log('Batch verification completed:', data);
    } catch (error) {
      console.error('Error during batch verification:', error);
      toast.error('Failed to verify payments. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'not_paid':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'not_paid':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Payment Verification
        </CardTitle>
        <CardDescription>
          Verify pending payments against Stripe to update their status in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleBatchVerification}
            disabled={isVerifying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verifying...' : 'Verify All Pending Payments'}
          </Button>
        </div>

        {lastResult && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{lastResult.total}</div>
                <div className="text-sm text-blue-600">Total Checked</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{lastResult.verified}</div>
                <div className="text-sm text-green-600">Verified</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{lastResult.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            {lastResult.results && lastResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Verification Results:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {lastResult.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <span className="font-mono text-sm">{result.paymentId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusBadgeClass(result.status)}>
                          {result.status}
                        </Badge>
                        {result.stripeStatus && (
                          <Badge variant="secondary" className="text-xs">
                            Stripe: {result.stripeStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
