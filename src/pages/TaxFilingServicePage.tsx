
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCheckout } from '@/hooks/useCheckout';
import { useTaxFilingSession } from '@/hooks/useTaxFilingSession';
import LoadingState from '@/components/taxfiling/LoadingState';
import InvalidSessionState from '@/components/taxfiling/InvalidSessionState';
import TaxFilingServiceContent from '@/components/taxfiling/TaxFilingServiceContent';

const TaxFilingServicePage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const { 
    sessionData: { 
      sessionValid, 
      hasDocumentRetrieval, 
      ownersCount, 
      propertiesCount, 
      loading 
    }, 
    updateDocumentRetrieval 
  } = useTaxFilingSession(sessionId);
  
  const {
    loading: checkoutLoading,
    handleCheckout
  } = useCheckout(hasDocumentRetrieval);

  const handleToggleDocumentRetrieval = async () => {
    await updateDocumentRetrieval(!hasDocumentRetrieval);
  };
  
  const handleProceedToCheckout = async () => {
    // Save session ID in session storage for the checkout process
    if (sessionId) {
      sessionStorage.setItem('purchaseId', sessionId);
    }
    
    // Make sure the owner and property counts are in session storage
    sessionStorage.setItem('ownersCount', ownersCount.toString());
    sessionStorage.setItem('propertiesCount', propertiesCount.toString());

    // Proceed to checkout using the hook
    await handleCheckout();
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!sessionValid) {
    return <InvalidSessionState onReturnToDashboard={handleReturnToDashboard} />;
  }
  
  return (
    <TaxFilingServiceContent
      ownersCount={ownersCount}
      propertiesCount={propertiesCount}
      hasDocumentRetrieval={hasDocumentRetrieval}
      checkoutLoading={checkoutLoading}
      onCheckout={handleProceedToCheckout}
      onToggleDocumentRetrieval={handleToggleDocumentRetrieval}
      onReturnToDashboard={handleReturnToDashboard}
    />
  );
};

export default TaxFilingServicePage;
