
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { submitFormData } from '@/components/form/review/submitUtils';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  processingSubmission: boolean;
  setProcessingSubmission: (value: boolean) => void;
  submissionCompleted: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingSubmission, setProcessingSubmission] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [pendingSubmissionProcessed, setPendingSubmissionProcessed] = useState(false);

  const checkAndSubmitPendingFormData = async (userId: string, event?: string) => {
    try {
      // If we already processed a submission for this session, don't do it again
      if (pendingSubmissionProcessed || submissionCompleted) {
        console.log("Submission already processed in this session, skipping");
        return;
      }

      // If we're already processing a submission, don't start another one
      if (processingSubmission) {
        console.log("Already processing a submission, skipping duplicate attempt");
        return;
      }

      // Check if there's pending form data in session storage
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      
      // If there's no pending form data and we have a redirectToDashboard flag,
      // the form was already submitted during signup - no need to process again
      if (!pendingFormDataStr && sessionStorage.getItem('formSubmittedDuringSignup') === 'true') {
        console.log("Form was already submitted during signup, skipping duplicate submission");
        setPendingSubmissionProcessed(true);
        return;
      }
      
      if (pendingFormDataStr) {
        // Set processing flag to prevent multiple submissions
        setProcessingSubmission(true);
        
        console.log(`Found pending form data after ${event || 'auth state change'}, submitting with user ID:`, userId);
        
        const pendingFormData = JSON.parse(pendingFormDataStr);
        
        // Ensure we have all required data before submitting
        if (!pendingFormData.owners || !pendingFormData.properties) {
          console.warn("Pending form data is incomplete, cannot submit", pendingFormData);
          setProcessingSubmission(false);
          return;
        }

        // Add a submission tracking ID to debug any potential duplicates
        const submissionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`Starting submission ${submissionId} for user ${userId}`);
        
        try {
          // Submit the form data with the user ID
          const result = await submitFormData(
            pendingFormData.owners,
            pendingFormData.properties,
            pendingFormData.assignments,
            pendingFormData.contactInfo,
            userId
          );
          
          if (result.success) {
            // Store IDs in session storage
            if (result.submissionId) {
              sessionStorage.setItem('submissionId', result.submissionId);
            }
            
            if (result.purchaseId) {
              sessionStorage.setItem('purchaseId', result.purchaseId);
            }
            
            // Immediately clear the pending form data after successful submission
            sessionStorage.removeItem('pendingFormData');
            console.log(`Successfully submitted pending form data (ID: ${submissionId}) for user:`, userId);
            
            // Mark submission as completed to prevent duplicates
            setSubmissionCompleted(true);
            setPendingSubmissionProcessed(true);
            
            // Set a flag to redirect to dashboard after form submission
            sessionStorage.setItem('redirectToDashboard', 'true');
          } else {
            console.error(`Submission ${submissionId} failed with success=false`);
          }
        } catch (error) {
          console.error(`Submission ${submissionId} failed:`, error);
        }

        // Reset the processing flag after submission attempt
        setProcessingSubmission(false);
      } else {
        console.log("No pending form data found for user:", userId);
      }
    } catch (error) {
      console.error("Error submitting pending form data:", error);
      setProcessingSubmission(false);
    }
  };

  useEffect(() => {
    // Set auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, "User:", newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // When a user signs in, session is refreshed, or email is verified, check for and submit pending form data
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && newSession?.user) {
        // Use setTimeout to ensure auth state is fully updated and avoid race conditions
        setTimeout(() => {
          // Only check for pending form data if email verification completed
          if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && newSession.user.email_confirmed_at) {
            checkAndSubmitPendingFormData(newSession.user.id, event);
          } else if (event === 'SIGNED_IN') {
            // For regular sign-ins (not after signup), also check for pending data
            checkAndSubmitPendingFormData(newSession.user.id, event);
          }
          
          // Redirect to dashboard after email verification
          if ((event === 'USER_UPDATED' || (event === 'SIGNED_IN' && newSession.user.email_confirmed_at)) 
              && (sessionStorage.getItem('redirectToDashboard') === 'true' || sessionStorage.getItem('formSubmittedDuringSignup') === 'true')) {
            // Check if we're not already on the dashboard
            if (!window.location.pathname.includes('/dashboard')) {
              console.log("Redirecting to dashboard after authentication event:", event);
              // Clear the formSubmittedDuringSignup flag
              sessionStorage.removeItem('formSubmittedDuringSignup');
              window.location.href = '/dashboard';
            }
          }
        }, 1000);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      // If there's a user, check for pending form data
      if (initialSession?.user) {
        setTimeout(() => {
          checkAndSubmitPendingFormData(initialSession.user.id, 'initial_load');
        }, 1000);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        loading,
        processingSubmission,
        setProcessingSubmission,
        submissionCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
