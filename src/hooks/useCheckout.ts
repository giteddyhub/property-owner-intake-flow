
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UseCheckoutResult = {
  loading: boolean;
  handleCheckout: () => Promise<void>;
};

export const useCheckout = (hasDocumentRetrieval: boolean): UseCheckoutResult => {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Get the contact ID from sessionStorage
      const contactId = sessionStorage.getItem('contactId');
      
      if (!contactId) {
        toast.error('Contact information not found. Please try again or contact support.');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          contactId,
          hasDocumentRetrievalService: hasDocumentRetrieval 
        },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Unable to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCheckout
  };
};
