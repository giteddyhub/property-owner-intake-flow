
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SuccessHeader from '@/components/success/SuccessHeader';
import PdfDownloadCard from '@/components/success/PdfDownloadCard';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import PaymentConfirmation from '@/components/success/PaymentConfirmation';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { useCheckout } from '@/hooks/useCheckout';
import { toast } from 'sonner';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [documentRetrievalEnabled, setDocumentRetrievalEnabled] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  
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
    // Try to get contactId from URL param or sessionStorage
    const contactIdFromParam = contactParam;
    const contactIdFromStorage = sessionStorage.getItem('contactId');
    
    if (contactIdFromParam) {
      setContactId(contactIdFromParam);
    } else if (contactIdFromStorage) {
      setContactId(contactIdFromStorage);
    } else {
      toast.error('Contact information not found. Some features may be limited.');
    }
    
    const retrievalService = sessionStorage.getItem('hasDocumentRetrievalService');
    if (retrievalService) {
      const hasService = JSON.parse(retrievalService);
      setDocumentRetrievalEnabled(hasService);
      setHasDocumentRetrieval(hasService);
    }
  }, [setHasDocumentRetrieval, contactParam]);
  
  // Determine if we're loading anything
  const isLoading = verifyLoading || checkoutLoading;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <SuccessHeader />
        
        {/* PDF Download Card - replaces NextStepsCard */}
        {contactId && <PdfDownloadCard contactId={contactId} />}
        
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
        
        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="mt-4">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
