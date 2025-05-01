
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { submitFormData } from '@/components/form/review/submitUtils';
import { toast } from 'sonner';

interface AuthContextType {
  user: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
  processingSubmission: boolean;
  setProcessingSubmission: (value: boolean) => void;
  submissionCompleted: boolean;
  setSubmissionCompleted: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthContext] Auth state changed:", event, "User:", session?.user?.id);
        setUser(session?.user || null);
        
        // Process pending form submission if this is a new sign-in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("[AuthContext] User signed in, checking for pending form data");
          setTimeout(() => {
            checkPendingFormData(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] Initial session check:", session?.user?.id || "No session");
      setUser(session?.user || null);
      setLoading(false);
      
      // Check for pending form data on initial load
      if (session?.user) {
        setTimeout(() => {
          checkPendingFormData(session.user.id);
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Function to handle pending form data
  const checkPendingFormData = async (userId: string) => {
    const pendingFormData = sessionStorage.getItem('pendingFormData');
    const submitAfterVerification = sessionStorage.getItem('submitAfterVerification');
    
    if (pendingFormData && submitAfterVerification === 'true') {
      console.log("[AuthContext] Found pending form data with submitAfterVerification flag");
      
      try {
        setProcessingSubmission(true);
        
        const formData = JSON.parse(pendingFormData);
        const { owners, properties, assignments, contactInfo } = formData;
        
        // Make sure we have actual data to submit
        if (!owners?.length || !properties?.length) {
          console.log("[AuthContext] Invalid form data:", formData);
          toast.error("Unable to submit form: invalid data");
          return;
        }
        
        console.log(`[AuthContext] Submitting pending form data for user ${userId}`);
        
        // Ensure contact info has user's email and name if available
        if (!contactInfo.fullName && user?.user_metadata?.full_name) {
          contactInfo.fullName = user.user_metadata.full_name;
        }
        
        if (!contactInfo.email && user?.email) {
          contactInfo.email = user.email;
        }
        
        // Submit the data
        const result = await submitFormData(
          owners,
          properties,
          assignments,
          contactInfo,
          userId
        );
        
        if (result.success) {
          setSubmissionCompleted(true);
          // Clear flags after successful submission
          sessionStorage.removeItem('pendingFormData');
          sessionStorage.removeItem('submitAfterVerification');
          console.log("[AuthContext] Form submission completed successfully");
          
          // Check if we should redirect to dashboard
          const redirectToDashboard = sessionStorage.getItem('redirectToDashboard');
          if (redirectToDashboard === 'true') {
            window.location.href = '/dashboard';
          }
        } else {
          console.log(`[AuthContext] Submission failed:`, result.error);
          toast.error(`Failed to submit your data: ${result.error}`);
        }
      } catch (error) {
        console.error("[AuthContext] Error submitting pending form data:", error);
        toast.error("There was an error processing your submission.");
      } finally {
        setProcessingSubmission(false);
      }
    } else {
      console.log("[AuthContext] No pending form data found or no submitAfterVerification flag");
    }
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
  };

  const signOut = async () => {
    // Clear any pending form data
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    sessionStorage.removeItem('redirectToDashboard');
    setSubmissionCompleted(false);
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        loading,
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
