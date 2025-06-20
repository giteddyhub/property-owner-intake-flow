
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
  
  // Simplified auth state changes - just handle admin status
  React.useEffect(() => {
    console.log("[AuthContext] Auth state changed, user:", user?.id);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Check admin status when user logs in
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          setTimeout(() => {
            checkAdminStatus();
          }, 500);
        }

        // Clean up legacy form data on any auth state change
        if (session?.user) {
          setTimeout(() => {
            processPendingFormData(session.user.id);
          }, 500);
        }

        // Reset admin status on sign-out
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    // Check admin status on initial load
    if (user && isInitialized) {
      checkAdminStatus();
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
