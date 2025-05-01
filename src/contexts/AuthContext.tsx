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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);
  const [submissionAttempts, setSubmissionAttempts] = useState<number>(0);

  useEffect(() => {
    console.log("[AuthContext] Setting up auth state listener");
    
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthContext] Auth state changed:", event, "User:", session?.user?.id);
        
        const previousUser = user;
        const newUser = session?.user || null;
        setUser(newUser);
        
        // Process pending form submission if this is a new sign-in or confirmed email
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          console.log(`[AuthContext] ${event} event, checking for pending form data`);
          
          // Important: If this is a newly verified user (email confirmation)
          const isVerified = session.user.email_confirmed_at || session.user.confirmed_at;
          const wasJustVerified = 
            isVerified && 
            (!previousUser || 
              (!previousUser.email_confirmed_at && !previousUser.confirmed_at));
              
          if (wasJustVerified) {
            console.log("[AuthContext] User was just verified, will process pending form data");
            // Use setTimeout to avoid auth state conflicts
            setTimeout(() => {
              processPendingFormData(session.user.id);
            }, 500);
          } else {
            // Regular sign in, also check for pending data
            setTimeout(() => {
              processPendingFormData(session.user.id);
            }, 100);
          }
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
          processPendingFormData(session.user.id);
        }, 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Function to handle pending form data
  const processPendingFormData = async (userId: string) => {
    // Skip processing if we've already attempted too many times
    if (submissionAttempts > 3) {
      console.log("[AuthContext] Too many submission attempts, skipping");
      return;
    }
    
    const pendingFormData = sessionStorage.getItem('pendingFormData');
    const submitAfterVerification = sessionStorage.getItem('submitAfterVerification');
    const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
    
    console.log("[AuthContext] Processing pending data. Has data:", !!pendingFormData, 
      "Submit after verification:", submitAfterVerification, 
      "Force retry:", forceRetry);
      
    // Check if user's email is verified
    const { data } = await supabase.auth.getUser();
    const isVerified = data?.user?.email_confirmed_at || data?.user?.confirmed_at;
    console.log("[AuthContext] User verified:", isVerified);
    
    if (!isVerified) {
      console.log("[AuthContext] User email not verified, skipping submission");
      // Clear retry flag if set, to avoid infinite loops
      sessionStorage.removeItem('forceRetrySubmission');
      return;
    }
    
    if (pendingFormData && (submitAfterVerification === 'true' || forceRetry)) {
      console.log("[AuthContext] Found pending form data with submit flag or force retry");
      
      // Prevent processing if already handling a submission
      if (processingSubmission || submissionCompleted) {
        console.log("[AuthContext] Submission already in progress or completed, skipping");
        sessionStorage.removeItem('forceRetrySubmission');
        return;
      }
      
      try {
        setProcessingSubmission(true);
        setSubmissionAttempts(prev => prev + 1);
        
        const formData = JSON.parse(pendingFormData);
        const { owners, properties, assignments, contactInfo } = formData;
        
        // Make sure we have actual data to submit
        if (!Array.isArray(owners) || !Array.isArray(properties)) {
          console.error("[AuthContext] Invalid form data:", formData);
          toast.error("Unable to submit form: invalid data");
          return;
        }
        
        console.log(`[AuthContext] Submitting pending form data for user ${userId} with:`, {
          ownersCount: owners.length,
          propertiesCount: properties.length,
          assignmentsCount: assignments.length
        });
        
        // Ensure contact info has user's email and name if available
        if (!contactInfo.fullName && user?.user_metadata?.full_name) {
          contactInfo.fullName = user.user_metadata.full_name;
        }
        
        if (!contactInfo.email && user?.email) {
          contactInfo.email = user.email;
        }
        
        // Submit the data with explicit userId
        const result = await submitFormData(
          owners,
          properties,
          assignments,
          contactInfo,
          userId
        );
        
        if (result.success) {
          setSubmissionCompleted(true);
          // Mark form as submitted to prevent duplicate submissions
          sessionStorage.setItem('formSubmittedDuringSignup', 'true');
          // Clear flags after successful submission
          sessionStorage.removeItem('pendingFormData');
          sessionStorage.removeItem('submitAfterVerification');
          sessionStorage.removeItem('forceRetrySubmission');
          console.log("[AuthContext] Form submission completed successfully");
          
          toast.success("Your information has been submitted successfully!");
        } else {
          console.error(`[AuthContext] Submission failed:`, result.error);
          toast.error(`Failed to submit your data: ${result.error}`);
          
          // If the error suggests we should try again later, keep the retry flag
          if (result.error?.includes('try again') || result.error?.includes('Authorization error')) {
            sessionStorage.setItem('forceRetrySubmission', 'true');
          }
        }
      } catch (error: any) {
        console.error("[AuthContext] Error submitting pending form data:", error);
        toast.error("There was an error processing your submission.");
      } finally {
        setProcessingSubmission(false);
      }
    } else {
      console.log("[AuthContext] No pending form data found or no submission flag");
      // Always clear the retry flag when done checking
      sessionStorage.removeItem('forceRetrySubmission');
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
    sessionStorage.removeItem('formSubmittedDuringSignup');
    sessionStorage.removeItem('forceRetrySubmission');
    setSubmissionCompleted(false);
    setSubmissionAttempts(0);
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
