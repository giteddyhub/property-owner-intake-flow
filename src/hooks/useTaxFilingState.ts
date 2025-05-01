
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        throw submissionError;
      }
      
      console.log('Created form submission with ID:', formSubmission.id);
      
      // Define a default amount for the purchase entry
      // This will be updated during checkout with the final amount
      const defaultAmount = 0;
      
      // Create a purchase entry to track this session
      // We still need to provide contact_id for now, even though we're moving to form_submission_id
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          contact_id: formSubmission.id, // Required field until we fully migrate
          form_submission_id: formSubmission.id, // New field that replaces contact_id
          payment_status: 'pending',
          has_document_retrieval: false, // Will be set during checkout
          amount: defaultAmount // Add the mandatory amount field
        })
        .select('id')
        .single();
        
      if (purchaseError) {
        console.error('Failed to create purchase:', purchaseError);
        throw purchaseError;
      }
      
      console.log('Created purchase with ID:', purchase.id);
      return purchase.id;
      
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
