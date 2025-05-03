
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const signIn = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (!response.error && response.data?.user) {
      console.log("[AuthActions] Sign up successful, user created with ID:", response.data.user.id);
    }
    
    return response;
  }, []);

  const signOut = useCallback(async () => {
    // Clear any pending form data
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    sessionStorage.removeItem('redirectToDashboard');
    sessionStorage.removeItem('formSubmittedDuringSignup');
    sessionStorage.removeItem('forceRetrySubmission');
    sessionStorage.removeItem('submissionError');
    
    return await supabase.auth.signOut();
  }, []);

  return { signIn, signUp, signOut };
};
