
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import PaymentConfirmation from '@/components/success/PaymentConfirmation';
import LawFirmPartnership from '@/components/success/LawFirmPartnership';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { useCheckout } from '@/hooks/useCheckout';
import ConsultationBooking from '@/components/success/ConsultationBooking';
import Footer from '@/components/layout/Footer';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [documentRetrievalEnabled, setDocumentRetrievalEnabled] = useState(false);
  const [ownersCount, setOwnersCount] = useState(1);
  const [propertiesCount, setPropertiesCount] = useState(1);
  
  const sessionId = searchParams.get('session_id');
  const contactParam = searchParams.get('contact');
  
  // Custom hooks for payment verification and checkout
  const { 
    loading: verifyLoading, 
    paymentStatus, 
    hasDocumentRetrieval, 
    setHasDocumentRetrieval 
  } = usePaymentVerification(sessionId);
  
  const { loading: checkoutLoading, handleCheckout } = useCheckout(hasDocumentRetrieval);
  
  // Check if user opted for document retrieval service and get counts from session storage
  useEffect(() => {
    const retrievalService = sessionStorage.getItem('hasDocumentRetrievalService');
    if (retrievalService) {
      const hasService = JSON.parse(retrievalService);
      setDocumentRetrievalEnabled(hasService);
      setHasDocumentRetrieval(hasService);
    }

    // Try to get owner and property counts from session storage
    const storedOwnersCount = sessionStorage.getItem('ownersCount');
    const storedPropertiesCount = sessionStorage.getItem('propertiesCount');
    
    if (storedOwnersCount) {
      setOwnersCount(parseInt(storedOwnersCount, 10) || 1);
    }
    
    if (storedPropertiesCount) {
      setPropertiesCount(parseInt(storedPropertiesCount, 10) || 1);
    }
  }, [setHasDocumentRetrieval]);
  
  const handleToggleDocumentRetrieval = () => {
    const newValue = !hasDocumentRetrieval;
    setHasDocumentRetrieval(newValue);
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(newValue));
  };
  
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
              ownersCount={ownersCount}
              propertiesCount={propertiesCount}
              hasDocumentRetrieval={hasDocumentRetrieval}
              loading={isLoading}
              onCheckout={handleCheckout}
              onToggleDocumentRetrieval={handleToggleDocumentRetrieval}
            />
          )}
          
          <LawFirmPartnership />
          
          {/* Payment confirmation section */}
          {paymentStatus === 'paid' && (
            <PaymentConfirmation 
              hasDocumentRetrieval={hasDocumentRetrieval}
              ownersCount={ownersCount}
              propertiesCount={propertiesCount}
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
