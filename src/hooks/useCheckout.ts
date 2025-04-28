
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
      // Get the purchase ID from sessionStorage
      const purchaseId = sessionStorage.getItem('purchaseId');
      
      if (!purchaseId) {
        toast.error('Purchase information not found. Please try again or contact support.');
        return;
      }
      
      toast.info('Preparing your checkout...');
      console.log('Initiating checkout with:', { purchaseId, hasDocumentRetrieval });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          purchaseId,
          hasDocumentRetrievalService: hasDocumentRetrieval 
        },
      });
      
      if (error) {
        console.error('Checkout error:', error);
        toast.error(`Checkout error: ${error.message}`);
        throw error;
      }
      
      if (!data?.url) {
        const errorMsg = 'No checkout URL returned from server';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Redirecting to Stripe checkout:', data.url);
      toast.success('Redirecting to secure payment page...');
      
      // Small delay to allow toast to be seen
      setTimeout(() => {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }, 500);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Unable to initiate checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCheckout
  };
};
