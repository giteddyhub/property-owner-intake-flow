
import React, { createContext, useContext } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useFormSubmissionHandler } from './useFormSubmissionHandler';
import { AuthContextType, AuthProviderProps } from './authTypes';

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
  
  // Handle auth state changes and form submission attempts
  React.useEffect(() => {
    console.log("[AuthContext] Auth state changed, user:", user?.id);
    
    // Set up auth state listener to process pending form data
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const previousUser = user;
        const newUser = session?.user || null;
        
        // Process pending form submission if this is a new sign-in or confirmed email
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          console.log(`[AuthContext] ${event} event, checking for pending form data`);
          
          // Check if this is a newly verified user (email confirmation)
          const isVerified = session.user.email_confirmed_at || session.user.confirmed_at;
          const wasJustVerified = 
            isVerified && 
            (!previousUser || 
              (!previousUser.email_confirmed_at && !previousUser.confirmed_at));
              
          // Handle email verification - set flag for redirect to dashboard if on verification page
          if (wasJustVerified) {
            // Set redirect flag to use in VerifyEmailPage
            sessionStorage.setItem('emailJustVerified', 'true');
            
            // Mark dashboard redirect for any page that checks
            sessionStorage.setItem('redirectToDashboard', 'true');
          }
          
          // Attempt to process any pending form data - our new RLS policies should handle unverified users
          const shouldProcessFormData = event === 'SIGNED_IN' || wasJustVerified || 
            sessionStorage.getItem('forceRetrySubmission') === 'true';
          
          if (shouldProcessFormData) {
            console.log("[AuthContext] Processing form data after auth event:", event);
            // Use setTimeout to avoid auth state conflicts
            setTimeout(() => {
              processPendingFormData(session.user.id);
            }, 500);
          }
        }
      }
    );

    // Check for pending form data on initial load
    if (user && isInitialized) {
      // Use setTimeout to avoid potential conflicts
      setTimeout(() => {
        const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
        if (forceRetry) {
          console.log("[AuthContext] Force retry flag found on initial load");
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
        setSubmissionCompleted
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
