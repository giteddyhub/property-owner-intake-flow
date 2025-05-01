
import React from 'react';
import { CheckCircle, FileSearch } from 'lucide-react';
import { calculatePricing } from '@/utils/pricingCalculator';
import PriceBreakdown from './PriceBreakdown';

type PaymentConfirmationProps = {
  hasDocumentRetrieval: boolean;
  ownersCount?: number;
  propertiesCount?: number;
};

const PaymentConfirmation = ({ 
  hasDocumentRetrieval,
  ownersCount = 1,
  propertiesCount = 1
}: PaymentConfirmationProps) => {
  const priceBreakdown = calculatePricing(ownersCount, propertiesCount, hasDocumentRetrieval);
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <div className="flex items-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
        <h2 className="ml-3 text-xl font-semibold text-green-800">Payment Successful</h2>
      </div>
      <p className="mt-2 text-green-700">
        Thank you for purchasing our full tax filing service! Our team will handle everything for you.
        You will receive a confirmation email with details shortly.
      </p>
      
      <div className="mt-4 p-4 bg-white rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">Purchase Summary</h3>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Owners:</span>
            <span>{ownersCount}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Properties:</span>
            <span>{propertiesCount}</span>
          </div>
        </div>
        
        <PriceBreakdown priceBreakdown={priceBreakdown} />
      </div>
      
      {hasDocumentRetrieval && (
        <div className="mt-4 flex items-start bg-blue-50 p-3 rounded-md">
          <FileSearch className="h-6 w-6 text-blue-500 mt-0.5 mr-2" />
          <div>
            <p className="font-medium text-blue-800">Document Retrieval Service Included</p>
            <p className="text-sm text-blue-700">
              We'll retrieve all necessary property documents from the Italian registry on your behalf.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
