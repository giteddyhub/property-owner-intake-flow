
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the parameters type for the RPC function
interface PurchaseParams {
  user_id_input: string;
  form_submission_id_input: string;
  payment_status_input: string;
  has_document_retrieval_input: boolean;
  amount_input: number;
}

// Define the response type for the RPC function
interface PurchaseResponse {
  id: string;
}

export const useTaxFilingState = () => {
  const [loading, setLoading] = useState(false);
  
  const createTaxFilingSession = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Creating tax filing session for user:', userId);
      
      if (!userId) {
        console.error('No user ID provided');
        toast.error('User authentication required. Please login again.');
        return null;
      }
      
      // Check if the user has profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('Profile lookup result:', profileData, profileError);
      
      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.error('No profile found for user:', userId);
        toast.error('User profile not found. Please complete your profile.');
        return null;
      }
      
      // Create a form submission entry for this tax filing session
      const { data: formSubmission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          user_id: userId,
          submitted_at: new Date().toISOString(),
          state: 'tax_filing_init',
        })
        .select('id')
        .single();
      
      if (submissionError) {
        console.error('Failed to create form submission:', submissionError);
        toast.error('Failed to create tax filing session. Please try again.');
        throw submissionError;
      }
      
      console.log('Created form submission with ID:', formSubmission.id);
      
      // Create a contacts entry if it doesn't exist yet
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      let contactId;
      
      if (contactError || !contactData) {
        console.log('No contact found, creating one');
        // Create a new contact if none exists
        const { data: newContact, error: newContactError } = await supabase
          .from('contacts')
          .insert({
            user_id: userId,
            full_name: profileData.full_name || '',
            email: profileData.email || '',
            submitted_at: new Date().toISOString(),
          })
          .select('id')
          .single();
          
        if (newContactError) {
          console.error('Failed to create contact:', newContactError);
          throw newContactError;
        }
        
        contactId = newContact.id;
      } else {
        contactId = contactData.id;
      }
      
      console.log('Using contact ID:', contactId);
      
      // Define a default amount for the purchase entry
      const defaultAmount = 0;
      
      try {
        // Try direct insert first with explicit user_id set
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            contact_id: contactId, 
            form_submission_id: formSubmission.id,
            payment_status: 'pending',
            has_document_retrieval: false,
            amount: defaultAmount,
            user_id: userId // Explicitly set user_id for RLS
          })
          .select('id')
          .single();
          
        if (purchaseError) {
          console.error('Failed to create purchase with direct insert:', purchaseError);
          throw purchaseError;
        }
        
        console.log('Created purchase with direct insert, ID:', purchase.id);
        return purchase.id;
      } catch (purchaseError) {
        console.error('Purchase creation failed:', purchaseError);
        toast.error('Failed to create tax filing session. Please try again.');
        return null;
      }
    } catch (error) {
      console.error('Error creating tax filing session:', error);
      toast.error('Failed to start tax filing service. Please try again later.');
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
