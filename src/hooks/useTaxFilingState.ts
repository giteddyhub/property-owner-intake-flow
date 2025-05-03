
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
        throw submissionError;
      }
      
      console.log('Created form submission with ID:', formSubmission.id);
      
      // Define a default amount for the purchase entry
      const defaultAmount = 0;
      
      try {
        // Create a purchase entry with RPC function to bypass RLS
        // Using the correct generic type parameter order for the RPC method
        const { data, error: purchaseError } = await supabase
          .rpc('create_purchase_for_user', {
            user_id_input: userId,
            form_submission_id_input: formSubmission.id,
            payment_status_input: 'pending',
            has_document_retrieval_input: false,
            amount_input: defaultAmount
          }) as { data: PurchaseResponse | null; error: any };
          
        if (purchaseError) {
          console.error('Failed to create purchase with RPC:', purchaseError);
          throw purchaseError;
        }
        
        // Ensure data has the expected structure before accessing properties
        if (data && typeof data === 'object' && 'id' in data) {
          console.log('Created purchase with ID:', data.id);
          return data.id;
        } else {
          console.error('Purchase created but no ID returned');
          throw new Error('Purchase creation failed: No ID returned');
        }
      } catch (purchaseError) {
        console.error('Purchase creation failed:', purchaseError);
        
        // Fallback insert method if RPC fails 
        // (This will still fail if the RLS policy doesn't allow it)
        const { data: purchase, error: directPurchaseError } = await supabase
          .from('purchases')
          .insert({
            contact_id: formSubmission.id, // Required field until we fully migrate
            form_submission_id: formSubmission.id, // New field that replaces contact_id
            payment_status: 'pending',
            has_document_retrieval: false, // Will be set during checkout
            amount: defaultAmount, // Add the mandatory amount field
            user_id: userId // Explicitly set user_id for RLS
          })
          .select('id')
          .single();
          
        if (directPurchaseError) {
          console.error('Failed to create purchase with direct insert:', directPurchaseError);
          throw directPurchaseError;
        }
        
        console.log('Created purchase with direct insert, ID:', purchase.id);
        return purchase.id;
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
