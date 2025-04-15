
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import PaymentConfirmation from '@/components/success/PaymentConfirmation';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { useCheckout } from '@/hooks/useCheckout';
import ConsultationBooking from '@/components/success/ConsultationBooking';
import Footer from '@/components/layout/Footer';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [documentRetrievalEnabled, setDocumentRetrievalEnabled] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  const contactParam = searchParams.get('contact');
  
  // Calculate prices
  const basePrice = 245;
  const documentRetrievalFee = 28;
  
  // Custom hooks for payment verification and checkout
  const { 
    loading: verifyLoading, 
    paymentStatus, 
    hasDocumentRetrieval, 
    setHasDocumentRetrieval 
  } = usePaymentVerification(sessionId);
  
  const { loading: checkoutLoading, handleCheckout } = useCheckout(hasDocumentRetrieval);
  
  // Check if user opted for document retrieval service
  useEffect(() => {
    const retrievalService = sessionStorage.getItem('hasDocumentRetrievalService');
    if (retrievalService) {
      const hasService = JSON.parse(retrievalService);
      setDocumentRetrievalEnabled(hasService);
      setHasDocumentRetrieval(hasService);
    }
  }, [setHasDocumentRetrieval]);
  
  // Determine if we're loading anything
  const isLoading = verifyLoading || checkoutLoading;
  
  const handleReturnHome = () => {
    window.location.href = 'https://www.italiantaxes.com/';
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SuccessHeader />
          
          {/* Premium Service Offer Card */}
          {!sessionId && !paymentStatus && (
            <PremiumServiceCard
              basePrice={basePrice}
              documentRetrievalFee={documentRetrievalFee}
              hasDocumentRetrieval={hasDocumentRetrieval}
              loading={isLoading}
              onCheckout={handleCheckout}
            />
          )}
          
          {/* Payment confirmation section */}
          {paymentStatus === 'paid' && (
            <PaymentConfirmation 
              hasDocumentRetrieval={hasDocumentRetrieval} 
            />
          )}
          
          {/* Consultation Booking Section */}
          <ConsultationBooking />
          
          <div className="text-center">
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleReturnHome}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SuccessPage;

