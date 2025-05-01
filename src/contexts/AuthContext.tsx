
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  ensureUserAssociation: (email: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN') {
          // User has signed in
          toast.success("Successfully signed in!");
          
          // Store the user ID in both sessionStorage and localStorage for persistence
          if (session?.user?.id) {
            sessionStorage.setItem('pendingUserId', session.user.id);
            localStorage.setItem('pendingUserId', session.user.id);
            
            // Check if we need to associate any orphaned data
            if (session.user.email) {
              import('@/hooks/dashboard/mappers/assignmentMapper').then(module => {
                module.associateOrphanedData(session.user.id, session.user.email)
                  .then(result => {
                    if (result.success) {
                      toast.success(`Successfully associated your previous submissions with your account`);
                    }
                  })
                  .catch(err => console.error("Error associating data:", err));
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User has signed out
          toast.info("You have been signed out");
          
          // Clear stored IDs
          sessionStorage.removeItem('pendingUserId');
          localStorage.removeItem('pendingUserId');
        } else if (event === 'USER_UPDATED') {
          // This happens when email is verified
          toast.success("User information updated successfully!");
        }
        
        // Update session and user state
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Store the user ID if available
      if (session?.user?.id) {
        sessionStorage.setItem('pendingUserId', session.user.id);
        localStorage.setItem('pendingUserId', session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    // If signup is successful, store the user ID
    if (response.data?.user?.id) {
      console.log("Setting user ID in storage for new signup:", response.data.user.id);
      sessionStorage.setItem('pendingUserId', response.data.user.id);
      localStorage.setItem('pendingUserId', response.data.user.id);
    }
    
    return { error: response.error, data: response.data };
  };

  const signOut = async () => {
    // Clear stored user IDs
    sessionStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserId');
    
    await supabase.auth.signOut();
  };
  
  // Helper function to ensure user data is properly associated
  const ensureUserAssociation = async (email: string): Promise<string | null> => {
    // First check if we have a current authenticated user
    if (user?.id) {
      return user.id;
    }
    
    // Next check if we have a pending user ID in storage
    const pendingUserId = sessionStorage.getItem('pendingUserId') || 
                          localStorage.getItem('pendingUserId');
    if (pendingUserId) {
      return pendingUserId;
    }
    
    // If we have an email but no user ID, check if this email has an account
    if (email) {
      try {
        console.log("Checking for existing user with email:", email);
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking for existing user:", error);
          return null;
        }
        
        if (data?.id) {
          console.log("Found existing user ID for email:", data.id);
          // Store this user ID in session/local storage
          sessionStorage.setItem('pendingUserId', data.id);
          localStorage.setItem('pendingUserId', data.id);
          return data.id;
        }
      } catch (error) {
        console.error("Error in ensureUserAssociation:", error);
      }
    }
    
    // No user association found
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      ensureUserAssociation 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
