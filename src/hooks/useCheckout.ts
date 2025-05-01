
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculatePricing } from '@/utils/pricingCalculator';

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
      
      // Get owner and property counts from sessionStorage or use default
      const ownersCount = parseInt(sessionStorage.getItem('ownersCount') || '1', 10);
      const propertiesCount = parseInt(sessionStorage.getItem('propertiesCount') || '1', 10);
      
      // Calculate the price based on the counts and document retrieval preference
      const priceBreakdown = calculatePricing(ownersCount, propertiesCount, hasDocumentRetrieval);
      
      toast.info('Preparing your checkout...');
      console.log('Initiating checkout with:', { 
        purchaseId, 
        hasDocumentRetrieval,
        ownersCount,
        propertiesCount,
        totalAmount: priceBreakdown.totalPrice
      });
      
      // Add a timeout to handle potential network issues
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      
      const fetchPromise = supabase.functions.invoke('create-checkout', {
        body: { 
          purchaseId,
          hasDocumentRetrievalService: hasDocumentRetrieval,
          ownersCount,
          propertiesCount,
          totalAmount: priceBreakdown.totalPrice
        },
      });
      
      // Race the fetch against a timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (response.error) {
        console.error('Checkout error:', response.error);
        toast.error(`Checkout error: ${response.error.message || 'Unable to process checkout'}`);
        throw response.error;
      }
      
      const data = response.data;
      
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
      
      // Provide more helpful error message based on error type
      if (error instanceof Error && error.message === 'Request timed out') {
        toast.error('The checkout service is taking too long to respond. Please try again later.');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Unable to connect to the payment service. Please check your internet connection and try again.');
      } else {
        toast.error('Unable to initiate checkout. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCheckout
  };
};
