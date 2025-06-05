
import React, { createContext, useContext, useState } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useFormSubmissionHandler } from './useFormSubmissionHandler';
import { AuthContextType, AuthProviderProps } from './authTypes';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, loading, isInitialized } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions();
  const {
    processingSubmission,
    setProcessingSubmission,
    submissionCompleted,
    setSubmissionCompleted,
    processPendingFormData
  } = useFormSubmissionHandler();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('is_authenticated_user_admin');
      
      if (error) {
        console.error("[AuthContext] Error checking admin status:", error);
        return false;
      }
      
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error("[AuthContext] Exception checking admin status:", error);
      return false;
    }
  };
  
  // Handle auth state changes and form submission attempts
  React.useEffect(() => {
    console.log("[AuthContext] Auth state changed, user:", user?.id);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user || null;
        
        // Check admin status when user logs in
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          setTimeout(() => {
            checkAdminStatus();
          }, 500);
        }
        
        // Handle form submission after email verification
        if (event === 'USER_UPDATED' && session?.user) {
          const isVerified = session.user.email_confirmed_at || session.user.confirmed_at;
          const shouldProcessForm = sessionStorage.getItem('processFormDataNow') === 'true' ||
                                   sessionStorage.getItem('emailJustVerified') === 'true';
          
          if (isVerified && shouldProcessForm) {
            console.log("[AuthContext] Processing form data after email verification");
            setTimeout(() => {
              processPendingFormData(session.user.id);
            }, 1000);
          }
        }
        
        // Handle retry submissions
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
          if (forceRetry) {
            console.log("[AuthContext] Force retry submission detected");
            setTimeout(() => {
              processPendingFormData(session.user.id);
            }, 1500);
          }
        }

        // Reset admin status on sign-out
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    // Check for pending submissions on initial load
    if (user && isInitialized) {
      checkAdminStatus();
      
      setTimeout(() => {
        const shouldProcess = sessionStorage.getItem('processFormDataNow') === 'true' ||
                             sessionStorage.getItem('forceRetrySubmission') === 'true';
        if (shouldProcess) {
          console.log("[AuthContext] Processing pending data on initial load");
          processPendingFormData(user.id);
        }
      }, 500);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, isInitialized, processPendingFormData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        loading: loading || !isInitialized,
        processingSubmission,
        setProcessingSubmission,
        submissionCompleted,
        setSubmissionCompleted,
        isAdmin,
        checkAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export useUser helper hook
export const useUser = () => {
  const { user } = useAuth();
  return { user, setUser: () => {} };
};
