
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import LawFirmPartnership from '@/components/success/LawFirmPartnership';
import ConsultationBooking from '@/components/success/ConsultationBooking';
import { useCheckout } from '@/hooks/useCheckout';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

const TaxFilingServicePage = () => {
  const {
    sessionId
  } = useParams<{
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [hasDocumentRetrieval, setHasDocumentRetrieval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [ownersCount, setOwnersCount] = useState(1);
  const [propertiesCount, setPropertiesCount] = useState(1);

  const {
    loading: checkoutLoading,
    handleCheckout
  } = useCheckout(hasDocumentRetrieval);

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
        const {
          data: purchaseData,
          error: purchaseError
        } = await supabase.from('purchases').select('id, contact_id, has_document_retrieval').eq('id', sessionId).single();
        if (purchaseError || !purchaseData) {
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }

        // Verify the purchase belongs to this user by checking contact table
        const {
          data: contactData,
          error: contactError
        } = await supabase.from('contacts').select('user_id').eq('id', purchaseData.contact_id).single();
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
        } 
        
        // Get counts of owners and properties for this user
        const { data: ownersData } = await supabase
          .from('owners')
          .select('id')
          .eq('user_id', user.id);
          
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('id, use_document_retrieval_service')
          .eq('user_id', user.id);
          
        // Update counts
        if (ownersData) {
          const count = ownersData.length || 1;
          setOwnersCount(count);
          // Store in sessionStorage for the checkout process
          sessionStorage.setItem('ownersCount', count.toString());
        }
        
        if (propertiesData) {
          const count = propertiesData.length || 1;
          setPropertiesCount(count);
          // Store in sessionStorage for the checkout process
          sessionStorage.setItem('propertiesCount', count.toString());
          
          // If any property has document retrieval enabled and this preference hasn't been set yet
          if (purchaseData.has_document_retrieval === null) {
            const hasAnyDocRetrieval = propertiesData.some(property => property.use_document_retrieval_service === true);
            setHasDocumentRetrieval(hasAnyDocRetrieval);

            // Update purchase record with this preference
            await supabase.from('purchases').update({
              has_document_retrieval: hasAnyDocRetrieval
            }).eq('id', sessionId);
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
        await supabase.from('purchases').update({
          has_document_retrieval: !hasDocumentRetrieval
        }).eq('id', sessionId);
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
            ownersCount={ownersCount}
            propertiesCount={propertiesCount}
            hasDocumentRetrieval={hasDocumentRetrieval}
            loading={checkoutLoading}
            onCheckout={handleProceedToCheckout}
            onToggleDocumentRetrieval={handleToggleDocumentRetrieval}
          />
          
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
