
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
    console.log('[useCheckout] Starting checkout process');
    
    try {
      setLoading(true);
      
      // Get the purchase ID from sessionStorage
      const purchaseId = sessionStorage.getItem('purchaseId');
      
      if (!purchaseId) {
        console.error('[useCheckout] No purchase ID found in session storage');
        toast.error('Purchase information not found. Please try again or contact support.');
        return;
      }
      
      // Get owner and property counts from sessionStorage or use default
      const ownersCount = parseInt(sessionStorage.getItem('ownersCount') || '1', 10);
      const propertiesCount = parseInt(sessionStorage.getItem('propertiesCount') || '1', 10);
      
      // Calculate the price based on the counts and document retrieval preference
      const priceBreakdown = calculatePricing(ownersCount, propertiesCount, hasDocumentRetrieval);
      
      console.log('[useCheckout] Checkout parameters:', { 
        purchaseId, 
        hasDocumentRetrieval,
        ownersCount,
        propertiesCount,
        totalAmount: priceBreakdown.totalPrice
      });
      
      toast.info('Preparing your checkout...');
      
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Checkout request timed out after 30 seconds')), 30000)
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
      
      console.log('[useCheckout] Invoking create-checkout function');
      
      // Race the fetch against a timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      console.log('[useCheckout] Received response:', response);
      
      if (response.error) {
        console.error('[useCheckout] Checkout error:', response.error);
        toast.error(`Checkout error: ${response.error.message || 'Unable to process checkout'}`);
        throw response.error;
      }
      
      const data = response.data;
      
      if (!data?.url) {
        const errorMsg = 'No checkout URL returned from server';
        console.error('[useCheckout] ' + errorMsg, data);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[useCheckout] Checkout URL received:', data.url);
      
      // Validate the URL format
      try {
        new URL(data.url);
      } catch (urlError) {
        console.error('[useCheckout] Invalid URL format:', data.url);
        toast.error('Invalid checkout URL received');
        throw new Error('Invalid checkout URL format');
      }
      
      toast.success('Redirecting to secure payment page...');
      
      // Set loading to false before redirect to prevent infinite loading
      setLoading(false);
      
      // Use a more reliable redirect approach - open in new tab
      console.log('[useCheckout] Opening Stripe checkout in new tab');
      const newWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        console.warn('[useCheckout] Popup blocked, trying fallback redirect');
        toast.warning('Popup blocked. Trying alternative redirect...');
        
        // Fallback: try direct navigation
        setTimeout(() => {
          try {
            window.location.href = data.url;
          } catch (redirectError) {
            console.error('[useCheckout] Fallback redirect failed:', redirectError);
            toast.error('Unable to redirect to payment page. Please try again or contact support.');
            setLoading(false);
          }
        }, 1000);
      } else {
        console.log('[useCheckout] Successfully opened checkout in new tab');
        toast.info('Payment page opened in new tab. Complete your payment there.');
      }
      
    } catch (error) {
      console.error('[useCheckout] Error creating checkout session:', error);
      
      // Provide more helpful error message based on error type
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          toast.error('The checkout service is taking too long to respond. Please try again later.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          toast.error('Unable to connect to the payment service. Please check your internet connection and try again.');
        } else if (error.message.includes('Invalid checkout URL')) {
          toast.error('There was an issue with the payment setup. Please contact support.');
        } else {
          toast.error('Unable to initiate checkout. Please try again later or contact support.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Ensure loading is always set to false, even if there was an error
      setLoading(false);
    }
  };

  return {
    loading,
    handleCheckout
  };
};
