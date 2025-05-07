
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
    // First clear any session storage items that might be causing persistence issues
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any pending form data
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    sessionStorage.removeItem('redirectToDashboard');
    sessionStorage.removeItem('formSubmittedDuringSignup');
    sessionStorage.removeItem('forceRetrySubmission');
    sessionStorage.removeItem('submissionError');
    sessionStorage.removeItem('emailJustVerified');
    
    // Now perform the actual sign out
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AuthActions] Error signing out:", error);
        throw error;
      }
      
      console.log("[AuthActions] Sign out successful");
      return { error: null };
    } catch (error) {
      console.error("[AuthActions] Exception during sign out:", error);
      throw error;
    }
  }, []);

  return { signIn, signUp, signOut };
};
