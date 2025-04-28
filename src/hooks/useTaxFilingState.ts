
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTaxFilingState = () => {
  const [loading, setLoading] = useState(false);
  
  const createTaxFilingSession = async (userId: string) => {
    try {
      setLoading(true);
      
      // Check if the user has a contact record first
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (contactError || !contactData) {
        // Create a contact record for this user if it doesn't exist
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        // Create a contact entry for the user
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert({
            user_id: userId,
            full_name: userData.user?.user_metadata?.full_name || 'Unknown Name',
            email: userData.user?.email || '',
            terms_accepted: true,
            privacy_accepted: true
          })
          .select('id')
          .single();
          
        if (createError) throw createError;
        
        // Use the new contact ID
        const contactId = newContact.id;
        
        // Define a default amount for the purchase entry
        // This will be updated during checkout with the final amount
        const defaultAmount = 0;
        
        // Create a purchase entry to track this session
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            contact_id: contactId,
            payment_status: 'pending',
            has_document_retrieval: null, // Will be set during checkout
            amount: defaultAmount // Add the mandatory amount field
          })
          .select('id')
          .single();
          
        if (purchaseError) throw purchaseError;
        
        return purchase.id;
      } else {
        // Use the existing contact ID
        const contactId = contactData.id;
        
        // Define a default amount for the purchase entry
        // This will be updated during checkout with the final amount
        const defaultAmount = 0;
        
        // Create a purchase entry to track this session
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            contact_id: contactId,
            payment_status: 'pending',
            has_document_retrieval: null, // Will be set during checkout
            amount: defaultAmount // Add the mandatory amount field
          })
          .select('id')
          .single();
          
        if (purchaseError) throw purchaseError;
        
        return purchase.id;
      }
    } catch (error) {
      console.error('Error creating tax filing session:', error);
      toast.error('Failed to start tax filing service. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    createTaxFilingSession
  };
};
