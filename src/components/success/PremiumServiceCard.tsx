import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ChevronRight, FileText, ShieldCheck, FileSearch } from 'lucide-react';
type PremiumServiceCardProps = {
  basePrice: number;
  documentRetrievalFee: number;
  hasDocumentRetrieval: boolean;
  loading: boolean;
  onCheckout: () => Promise<void>;
};
const PremiumServiceCard = ({
  basePrice,
  documentRetrievalFee,
  hasDocumentRetrieval,
  loading,
  onCheckout
}: PremiumServiceCardProps) => {
  const totalPrice = hasDocumentRetrieval ? basePrice + documentRetrievalFee : basePrice;
  return <Card className="border-2 border-amber-200 bg-amber-50 mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Full Service Tax Filing</h2>
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
            <span className="ml-3 text-gray-700">Complete tax return preparation</span>
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
        
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">${basePrice}</span>
                <span className="ml-2 text-sm text-gray-500 line-through">$285</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">Early Access</span>
              </div>
              <p className="text-sm text-gray-500">one-time fee</p>
            </div>
            
            {hasDocumentRetrieval && <div className="flex items-center bg-blue-50 px-3 py-2 rounded-md">
                <FileSearch className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Document Retrieval</p>
                  <p className="text-xs text-blue-600">+${documentRetrievalFee}</p>
                </div>
              </div>}
          </div>
          
          {hasDocumentRetrieval && <div className="mt-2 text-right text-sm font-medium text-gray-900">
              Total: ${totalPrice}
            </div>}
          
          <Button onClick={onCheckout} disabled={loading} className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
            {loading ? "Processing..." : `Purchase Full Service · $${totalPrice}`}
            {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
          
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Secure payment via Stripe
          </div>
        </div>
      </div>
    </Card>;
};
export default PremiumServiceCard;