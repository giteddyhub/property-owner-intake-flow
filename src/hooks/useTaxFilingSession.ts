
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TaxFilingSessionData = {
  sessionValid: boolean;
  hasDocumentRetrieval: boolean;
  ownersCount: number;
  propertiesCount: number;
  loading: boolean;
};

export const useTaxFilingSession = (sessionId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasDocumentRetrieval, setHasDocumentRetrieval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [ownersCount, setOwnersCount] = useState(1);
  const [propertiesCount, setPropertiesCount] = useState(1);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId || !user) {
        setSessionValid(false);
        return;
      }
      try {
        setLoading(true);

        // Check if purchase record exists
        const {
          data: purchaseData,
          error: purchaseError
        } = await supabase
          .from('purchases')
          .select('id, contact_id, has_document_retrieval')
          .eq('id', sessionId)
          .maybeSingle();
          
        if (purchaseError) {
          console.error('Error fetching purchase:', purchaseError);
          toast.error('Error loading tax filing session');
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }
        
        if (!purchaseData) {
          console.error('Purchase not found');
          toast.error('Tax filing session not found');
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }

        // Verify the purchase belongs to this user by checking contact table
        const {
          data: contactData,
          error: contactError
        } = await supabase
          .from('contacts')
          .select('user_id')
          .eq('id', purchaseData.contact_id)
          .maybeSingle();
          
        if (contactError) {
          console.error('Error fetching contact:', contactError);
          toast.error('Error verifying user access');
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }
        
        if (!contactData || contactData.user_id !== user.id) {
          console.error('Contact not found or does not belong to user');
          toast.error('You don\'t have access to this tax filing session');
          setSessionValid(false);
          navigate('/dashboard');
          return;
        }

        // Purchase record is valid and belongs to this user
        setSessionValid(true);

        // If the purchase has document retrieval preference already set, use it
        if (purchaseData.has_document_retrieval !== null) {
          setHasDocumentRetrieval(purchaseData.has_document_retrieval);
        } 
        
        // Get counts of owners and properties for this user
        const { data: ownersData } = await supabase
          .from('owners')
          .select('id')
          .eq('user_id', user.id);
          
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('id, use_document_retrieval_service')
          .eq('user_id', user.id);
          
        // Update counts
        if (ownersData) {
          const count = ownersData.length || 1;
          setOwnersCount(count);
          // Store in sessionStorage for the checkout process
          sessionStorage.setItem('ownersCount', count.toString());
        }
        
        if (propertiesData) {
          const count = propertiesData.length || 1;
          setPropertiesCount(count);
          // Store in sessionStorage for the checkout process
          sessionStorage.setItem('propertiesCount', count.toString());
          
          // If any property has document retrieval enabled and this preference hasn't been set yet
          if (purchaseData.has_document_retrieval === null) {
            const hasAnyDocRetrieval = propertiesData.some(property => property.use_document_retrieval_service === true);
            setHasDocumentRetrieval(hasAnyDocRetrieval);

            // Update purchase record with this preference
            await supabase
              .from('purchases')
              .update({
                has_document_retrieval: hasAnyDocRetrieval
              })
              .eq('id', sessionId);
          }
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        toast.error('Error loading tax filing service');
        setSessionValid(false);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [sessionId, user, navigate]);

  const updateDocumentRetrieval = async (value: boolean) => {
    setHasDocumentRetrieval(value);

    // Also update the purchase record with the new preference
    if (sessionId && sessionValid) {
      try {
        await supabase
          .from('purchases')
          .update({
            has_document_retrieval: value
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating document retrieval preference:', error);
      }
    }
  };

  return {
    sessionData: {
      sessionValid,
      hasDocumentRetrieval,
      ownersCount,
      propertiesCount,
      loading
    },
    updateDocumentRetrieval
  };
};
