
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndSubmitPendingFormData = async (userId: string) => {
    try {
      // Check if there's pending form data in session storage
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      if (pendingFormDataStr) {
        console.log("Found pending form data after auth state change, submitting with user ID:", userId);
        
        const pendingFormData = JSON.parse(pendingFormDataStr);
        
        // Ensure we have all required data before submitting
        if (!pendingFormData.owners || !pendingFormData.properties) {
          console.warn("Pending form data is incomplete, cannot submit", pendingFormData);
          return;
        }
        
        // Submit the form data with the user ID
        await submitFormData(
          pendingFormData.owners,
          pendingFormData.properties,
          pendingFormData.assignments,
          pendingFormData.contactInfo,
          userId
        );
        
        // Clear the pending form data from session storage
        sessionStorage.removeItem('pendingFormData');
        console.log("Successfully submitted pending form data for user:", userId);
        
        // Set a flag to redirect to dashboard after form submission
        sessionStorage.setItem('redirectToDashboard', 'true');
        
        // Redirect to dashboard if we're not already there
        if (!window.location.pathname.includes('/dashboard')) {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error("Error submitting pending form data:", error);
    }
  };

  useEffect(() => {
    // Set auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, "User:", newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // When a user signs in or the session is refreshed, check for and submit pending form data
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
        // Delay the submission to ensure auth state is fully updated
        setTimeout(() => {
          checkAndSubmitPendingFormData(newSession.user.id);
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
          checkAndSubmitPendingFormData(initialSession.user.id);
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
