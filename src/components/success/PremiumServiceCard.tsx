
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ChevronRight, FileText, ShieldCheck, FileSearch } from 'lucide-react';
import { calculatePricing, PriceBreakdown as PriceBreakdownType } from '@/utils/pricingCalculator';
import PriceBreakdown from './PriceBreakdown';

type PremiumServiceCardProps = {
  ownersCount: number;
  propertiesCount: number;
  hasDocumentRetrieval: boolean;
  loading: boolean;
  onCheckout: () => Promise<void>;
  onToggleDocumentRetrieval?: () => void;
};

const PremiumServiceCard = ({
  ownersCount,
  propertiesCount,
  hasDocumentRetrieval,
  loading,
  onCheckout,
  onToggleDocumentRetrieval
}: PremiumServiceCardProps) => {
  const priceBreakdown = calculatePricing(ownersCount, propertiesCount, hasDocumentRetrieval);

  return (
    <Card className="border-2 border-amber-200 bg-amber-50 mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Full Service Tax Filing 2025</h2>
            <p className="mt-2 text-gray-700">
              Let our tax professionals handle everything for you
            </p>
          </div>
          <div className="hidden md:block">
            <FileText className="h-12 w-12 text-amber-500" />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span className="ml-3 text-gray-700">Complete tax return preparation for {ownersCount} owner{ownersCount > 1 ? 's' : ''} and {propertiesCount} propert{propertiesCount > 1 ? 'ies' : 'y'}</span>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span className="ml-3 text-gray-700">Direct filing with Italian tax authorities</span>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span className="ml-3 text-gray-700">Personalized tax optimization advice</span>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span className="ml-3 text-gray-700">Priority support via email and phone</span>
          </div>
        </div>
        
        <div className="mt-6 border-t border-amber-200 pt-6">
          <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>Owners registered:</span>
            <span className="font-medium">{ownersCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Properties registered:</span>
            <span className="font-medium">{propertiesCount}</span>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div>
              <PriceBreakdown priceBreakdown={priceBreakdown} showDetailedBreakdown={false} />
            </div>
            
            {onToggleDocumentRetrieval && (
              <div 
                className={`flex items-center ${hasDocumentRetrieval ? 'bg-blue-50' : 'bg-gray-50'} px-3 py-2 rounded-md cursor-pointer`}
                onClick={onToggleDocumentRetrieval}
              >
                <FileSearch className={`h-5 w-5 ${hasDocumentRetrieval ? 'text-blue-500' : 'text-gray-400'} mr-2`} />
                <div>
                  <p className={`text-sm font-medium ${hasDocumentRetrieval ? 'text-blue-800' : 'text-gray-700'}`}>
                    Document Retrieval
                  </p>
                  <p className="text-xs text-gray-600">
                    +€{priceBreakdown.documentRetrievalFee || 28}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <PriceBreakdown priceBreakdown={priceBreakdown} />
          </div>
          
          <Button 
            onClick={onCheckout} 
            disabled={loading} 
            className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
            {loading ? "Processing..." : `Purchase Full Service · €${priceBreakdown.totalPrice}`}
            {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
          
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Secure payment via Stripe
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PremiumServiceCard;
