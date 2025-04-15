
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const PaymentCancelled = () => {
  const handleReturnHome = () => {
    window.location.href = 'https://www.italiantaxes.com/';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Cancelled</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your payment was cancelled. Don't worry, your tax information has still been submitted.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">What's Next?</h2>
              <p className="text-gray-600 mt-2">
                Even though you didn't complete the purchase of our full service, your tax information has been saved and will be processed.
              </p>
            </div>
            
            <p className="text-gray-700 mb-4">
              If you change your mind and would like to upgrade to our full service, you can:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-gray-900">Return to the success page</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Go back to the success page to purchase our full tax filing service.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-gray-900">Contact our support team</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Email us at support@italiantaxes.com if you have any questions or need assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            className="mr-4 bg-form-300 hover:bg-form-400 text-white"
            onClick={() => window.location.href = '/success'}
          >
            Return to Success Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleReturnHome}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;

