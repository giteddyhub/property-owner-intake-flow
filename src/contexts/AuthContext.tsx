
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { submitFormData } from '@/components/form/review/submitUtils';

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
        console.log("Auth state changed:", event, "User:", session?.user?.id);
        setUser(session?.user || null);
        
        // Check for pending form data if user just signed in
        if (event === 'SIGNED_IN' && session?.user) {
          const pendingFormData = sessionStorage.getItem('pendingFormData');
          
          if (pendingFormData) {
            console.log("Found pending form data after SIGNED_IN, submitting with user ID:", session.user.id);
            handlePendingFormSubmission(session.user.id, JSON.parse(pendingFormData));
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
      
      // Check for pending form data on initial load
      if (session?.user) {
        const pendingFormData = sessionStorage.getItem('pendingFormData');
        
        if (pendingFormData) {
          console.log("Found pending form data after initial_load, submitting with user ID:", session.user.id);
          handlePendingFormSubmission(session.user.id, JSON.parse(pendingFormData));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Function to handle form submission from pending data
  const handlePendingFormSubmission = async (userId, formData) => {
    if (processingSubmission || submissionCompleted) {
      console.log("Submission already in progress or completed, skipping duplicate submission");
      return;
    }
    
    try {
      setProcessingSubmission(true);
      
      console.log(`Starting submission ${Date.now()}-${Math.random().toString(36).substr(2, 9)} for user ${userId}`);
      
      const { owners, properties, assignments, contactInfo } = formData;
      
      if (!contactInfo.fullName && user?.user_metadata?.full_name) {
        contactInfo.fullName = user.user_metadata.full_name;
      }
      
      if (!contactInfo.email && user?.email) {
        contactInfo.email = user.email;
      }
      
      const result = await submitFormData(
        owners,
        properties,
        assignments,
        contactInfo,
        userId
      );
      
      if (result.success) {
        setSubmissionCompleted(true);
        sessionStorage.removeItem('pendingFormData');
      } else {
        console.log(`Submission ${Date.now()}-${Math.random().toString(36).substr(2, 9)} failed with success=false`);
      }
    } catch (error) {
      console.error("Error submitting pending form data:", error);
    } finally {
      setProcessingSubmission(false);
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
