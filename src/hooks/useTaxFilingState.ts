
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

      // Fetch user's properties to check for document retrieval preference
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('use_document_retrieval_service')
        .eq('user_id', userId);

      if (propertiesError) {
        console.error('Error fetching properties data:', propertiesError);
        // Non-critical error, continue with false as default
      }
      
      // Check if any property has document retrieval enabled
      const hasDocumentRetrieval = propertiesData && propertiesData.some(
        property => property.use_document_retrieval_service === true
      );
      
      console.log('Document retrieval service needed:', hasDocumentRetrieval);
      
      // Create a form submission entry for this tax filing session
      const { data: formSubmission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          user_id: userId,
          submitted_at: new Date().toISOString(),
          state: 'tax_filing_init',
          has_document_retrieval: hasDocumentRetrieval
        })
        .select('id')
        .single();
      
      if (submissionError) {
        console.error('Failed to create form submission:', submissionError);
        toast.error('Failed to create tax filing session. Please try again.');
        throw submissionError;
      }
      
      console.log('Created form submission with ID:', formSubmission.id);
      
      // Define a default amount for the purchase entry
      const defaultAmount = 0;
      
      // Create the purchase entry directly without needing a separate contact
      // since the form_submission already contains the user_id reference
      try {
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            form_submission_id: formSubmission.id,
            payment_status: 'pending',
            has_document_retrieval: hasDocumentRetrieval,
            amount: defaultAmount
          })
          .select('id')
          .single();
          
        if (purchaseError) {
          console.error('Failed to create purchase:', purchaseError);
          throw purchaseError;
        }
        
        console.log('Created purchase with ID:', purchase.id);
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
