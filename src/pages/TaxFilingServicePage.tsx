import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText } from 'lucide-react';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import LawFirmPartnership from '@/components/success/LawFirmPartnership';
import ConsultationBooking from '@/components/success/ConsultationBooking';
import { useCheckout } from '@/hooks/useCheckout';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

const TaxFilingServicePage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasDocumentRetrieval, setHasDocumentRetrieval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  // Calculate prices
  const basePrice = 245;
  const documentRetrievalFee = 28;
  const { loading: checkoutLoading, handleCheckout } = useCheckout(hasDocumentRetrieval);

  // Verify session exists and belongs to current user
  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId || !user) {
        setSessionValid(false);
        return;
      }
      try {
        setLoading(true);

        // Check if purchase record exists and belongs to this user
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('id, contact_id, has_document_retrieval')
          .eq('id', sessionId)
          .single();
          
        if (purchaseError || !purchaseData) {
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }
          
        // Verify the purchase belongs to this user by checking contact table
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('user_id')
          .eq('id', purchaseData.contact_id)
          .single();
          
        if (contactError || !contactData || contactData.user_id !== user.id) {
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }
        
        // Purchase record is valid and belongs to this user
        setSessionValid(true);
        
        // If the purchase has document retrieval preference already set, use it
        if (purchaseData.has_document_retrieval !== null) {
          setHasDocumentRetrieval(purchaseData.has_document_retrieval);
        } else {
          // Otherwise check if any property has document retrieval service
          const { data: propertiesData } = await supabase
            .from('properties')
            .select('use_document_retrieval_service')
            .eq('user_id', user.id);
            
          if (propertiesData && propertiesData.length > 0) {
            // If any property has document retrieval enabled, suggest it here
            const hasAnyDocRetrieval = propertiesData.some(
              property => property.use_document_retrieval_service === true
            );
            setHasDocumentRetrieval(hasAnyDocRetrieval);
            
            // Update purchase record with this preference
            await supabase
              .from('purchases')
              .update({ has_document_retrieval: hasAnyDocRetrieval })
              .eq('id', sessionId);
          }
        }

      } catch (error) {
        console.error('Error verifying session:', error);
        setSessionValid(false);
      } finally {
        setLoading(false);
      }
    };
    
    verifySession();
  }, [sessionId, user, navigate]);
  
  const handleToggleDocumentRetrieval = async () => {
    setHasDocumentRetrieval(!hasDocumentRetrieval);
    
    // Also update the purchase record with the new preference
    if (sessionId && sessionValid) {
      try {
        await supabase
          .from('purchases')
          .update({ has_document_retrieval: !hasDocumentRetrieval })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating document retrieval preference:', error);
      }
    }
  };
  
  const handleProceedToCheckout = async () => {
    // Save session ID in session storage for the checkout process
    if (sessionId) {
      sessionStorage.setItem('purchaseId', sessionId);
    }

    // Proceed to checkout using the hook
    await handleCheckout();
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }
  
  if (!sessionValid) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h1>
        <p className="text-gray-600 mb-6">This tax filing session is invalid or has expired.</p>
        <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
      </div>;
  }
  
  return <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SuccessHeader />
          
          <PremiumServiceCard 
            basePrice={basePrice} 
            documentRetrievalFee={documentRetrievalFee} 
            hasDocumentRetrieval={hasDocumentRetrieval} 
            loading={checkoutLoading} 
            onCheckout={handleProceedToCheckout} 
          />
          
          {/* Document Retrieval Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="documentRetrieval" type="checkbox" checked={hasDocumentRetrieval} onChange={handleToggleDocumentRetrieval} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="documentRetrieval" className="font-medium text-blue-800">
                  Add Document Retrieval Service (+${documentRetrievalFee})
                </label>
                <p className="text-blue-700">
                  We'll retrieve all necessary property documents from the Italian registry on your behalf.
                </p>
              </div>
            </div>
          </div>
          
          {/* Law Firm Partnership Section */}
          <LawFirmPartnership />
          
          {/* Consultation Booking Calendar */}
          <ConsultationBooking />
          
          <div className="text-center mt-8">
            <Button variant="outline" onClick={handleReturnToDashboard}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};

export default TaxFilingServicePage;
