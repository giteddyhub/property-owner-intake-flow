
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText } from 'lucide-react';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
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
        
        // Check local storage first for faster verification
        const localSession = localStorage.getItem('taxFilingSession');
        if (localSession === sessionId) {
          setSessionValid(true);
          // Load user's document retrieval preference if available
          const retrievalService = localStorage.getItem('hasDocumentRetrievalService');
          if (retrievalService) {
            setHasDocumentRetrieval(JSON.parse(retrievalService));
          }
        } else {
          // If not in local storage, verify from database using purchases table
          const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('id', sessionId)
            .eq('contact_id', user.id)
            .single();
          
          if (data) {
            setSessionValid(true);
            localStorage.setItem('taxFilingSession', sessionId);
            // If the purchase has document retrieval info already stored
            if (data.has_document_retrieval !== null) {
              setHasDocumentRetrieval(data.has_document_retrieval);
            }
          } else {
            setSessionValid(false);
            navigate('/dashboard');
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
  
  const handleToggleDocumentRetrieval = () => {
    setHasDocumentRetrieval(!hasDocumentRetrieval);
    localStorage.setItem('hasDocumentRetrievalService', JSON.stringify(!hasDocumentRetrieval));
  };
  
  const handleProceedToCheckout = async () => {
    // Save contact ID in session storage for the checkout process
    if (user) {
      sessionStorage.setItem('contactId', user.id);
    }
    
    // Proceed to checkout using the hook
    await handleCheckout();
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!sessionValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h1>
        <p className="text-gray-600 mb-6">This tax filing session is invalid or has expired.</p>
        <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SuccessHeader />
          
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-form-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-form-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Italian Property Tax Filing</h2>
                <p className="mt-1 text-gray-600">
                  Based on your property information, we can prepare and file your Italian taxes.
                </p>
              </div>
            </div>
          </div>
          
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
                <input
                  id="documentRetrieval"
                  type="checkbox"
                  checked={hasDocumentRetrieval}
                  onChange={handleToggleDocumentRetrieval}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
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
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleReturnToDashboard}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TaxFilingServicePage;
