
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UsePaymentVerificationResult = {
  loading: boolean;
  paymentStatus: string | null;
  paymentVerified: boolean;
  hasDocumentRetrieval: boolean;
  ownersCount: number;
  propertiesCount: number;
  setHasDocumentRetrieval: React.Dispatch<React.SetStateAction<boolean>>;
};

export const usePaymentVerification = (sessionId: string | null): UsePaymentVerificationResult => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [hasDocumentRetrieval, setHasDocumentRetrieval] = useState(false);
  const [ownersCount, setOwnersCount] = useState(1);
  const [propertiesCount, setPropertiesCount] = useState(1);
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId && !paymentVerified) {
        try {
          setLoading(true);
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId },
          });
          
          if (error) throw error;
          
          if (data.status === 'paid') {
            setPaymentStatus('paid');
            setHasDocumentRetrieval(data.has_document_retrieval);
            
            // Set the owners and properties counts if available
            if (data.owners_count) {
              setOwnersCount(data.owners_count);
              sessionStorage.setItem('ownersCount', data.owners_count.toString());
            }
            
            if (data.properties_count) {
              setPropertiesCount(data.properties_count);
              sessionStorage.setItem('propertiesCount', data.properties_count.toString());
            }
            
            toast.success('Payment successful! Thank you for your purchase.');
          } else {
            setPaymentStatus(data.status);
          }
          
          setPaymentVerified(true);
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Unable to verify payment status');
        } finally {
          setLoading(false);
        }
      }
    };
    
    verifyPayment();
  }, [sessionId, paymentVerified]);

  return {
    loading,
    paymentStatus,
    paymentVerified,
    hasDocumentRetrieval,
    ownersCount,
    propertiesCount,
    setHasDocumentRetrieval
  };
};
