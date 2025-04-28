
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTaxFilingState = () => {
  const [loading, setLoading] = useState(false);
  
  const createTaxFilingSession = async (userId: string): Promise<string> => {
    try {
      setLoading(true);
      
      // Generate a unique session ID
      const sessionId = uuidv4();
      
      // Store session data in localStorage for persistence
      localStorage.setItem('taxFilingSession', sessionId);
      
      // Optionally store in database for server-side tracking
      const { error } = await supabase
        .from('tax_filing_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          created_at: new Date().toISOString(),
          status: 'initiated'
        });
      
      if (error) {
        console.error('Error creating tax filing session:', error);
        // Continue even if DB storage fails, since we have local storage
      }
      
      return sessionId;
    } catch (error) {
      console.error('Error in tax filing process:', error);
      toast.error('Unable to start tax filing process. Please try again.');
      return '';
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    createTaxFilingSession
  };
};
