import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authInitialized: boolean; // Add this property to match the return value
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
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log("Setting up auth provider and state listener");
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        // Update session and user state immediately for UI responsiveness
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in!");
          
          if (session?.user?.id) {
            sessionStorage.setItem('pendingUserId', session.user.id);
            localStorage.setItem('pendingUserId', session.user.id);
            
            if (session.user.email) {
              sessionStorage.setItem('userEmail', session.user.email);
              localStorage.setItem('userEmail', session.user.email);
              
              const contactId = sessionStorage.getItem('contactId') || localStorage.getItem('contactId');
              
              if (contactId) {
                console.log("Found pending contactId to update with user ID:", contactId);
                
                try {
                  const { error: updateError } = await supabase
                    .from('contacts')
                    .update({ user_id: session.user.id })
                    .eq('id', contactId);
                    
                  if (updateError) {
                    console.error("Error updating contact with user ID:", updateError);
                  } else {
                    console.log("Successfully updated contact with user ID");
                    
                    await associateOrphanedDataWithContactId(contactId, session.user.id);
                  }
                } catch (error) {
                  console.error("Exception while updating contact with user ID:", error);
                }
              }
              
              setTimeout(async () => {
                if (!mounted) return;
                
                try {
                  const { associateOrphanedData } = await import('@/hooks/dashboard/mappers/assignmentMapper');
                  if (session.user?.id && session.user?.email) {
                    const result = await associateOrphanedData(session.user.id, session.user.email);
                    if (result.success) {
                      toast.success(`Successfully associated your previous submissions with your account`);
                    }
                  }
                } catch (err) {
                  console.error("Error associating data:", err);
                }
              }, 1500);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info("You have been signed out");
          
          sessionStorage.removeItem('pendingUserId');
          localStorage.removeItem('pendingUserId');
        } else if (event === 'USER_UPDATED') {
          toast.success("User information updated successfully!");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        sessionStorage.setItem('pendingUserId', session.user.id);
        localStorage.setItem('pendingUserId', session.user.id);
        
        if (session.user.email) {
          sessionStorage.setItem('userEmail', session.user.email);
          localStorage.setItem('userEmail', session.user.email);
        }
      }
      
      setLoading(false);
      setAuthInitialized(true);
    }).catch(error => {
      console.error("Error getting initial session:", error);
      if (mounted) {
        setLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const associateOrphanedDataWithContactId = async (contactId: string, userId: string) => {
    try {
      console.log(`Associating all data for contact ${contactId} with user ${userId}`);
      
      const { error: ownersError } = await supabase
        .from('owners')
        .update({ user_id: userId })
        .eq('contact_id', contactId)
        .is('user_id', null);
        
      if (ownersError) {
        console.error("Error updating owners:", ownersError);
      }
      
      const { error: propertiesError } = await supabase
        .from('properties')
        .update({ user_id: userId })
        .eq('contact_id', contactId)
        .is('user_id', null);
        
      if (propertiesError) {
        console.error("Error updating properties:", propertiesError);
      }
      
      const { error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .update({ user_id: userId })
        .eq('contact_id', contactId)
        .is('user_id', null);
        
      if (assignmentsError) {
        console.error("Error updating assignments:", assignmentsError);
      }
      
      console.log("Completed associating orphaned data for contact");
    } catch (error) {
      console.error("Error in associateOrphanedDataWithContactId:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log(`Signing up new user with email ${email} and name ${fullName}`);
    
    sessionStorage.setItem('userEmail', email);
    localStorage.setItem('userEmail', email);
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (response.data?.user?.id) {
      sessionStorage.setItem('pendingUserId', response.data.user.id);
      localStorage.setItem('pendingUserId', response.data.user.id);
      
      const contactId = sessionStorage.getItem('contactId');
      if (contactId) {
        console.log("Found contactId in storage, attempting to update with user ID");
        
        try {
          const { error: updateError } = await supabase
            .from('contacts')
            .update({ user_id: response.data.user.id })
            .eq('id', contactId);
            
          if (updateError) {
            console.error("Error updating contact with user ID:", updateError);
          } else {
            console.log("Successfully updated contact with user ID");
            
            await associateOrphanedDataWithContactId(contactId, response.data.user.id);
          }
        } catch (error) {
          console.error("Exception while updating contact with user ID:", error);
        }
      }
    }
    
    return { error: response.error, data: response.data };
  };

  const signOut = async () => {
    sessionStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserId');
    
    await supabase.auth.signOut();
  };
  
  const ensureUserAssociation = async (email: string): Promise<string | null> => {
    if (user?.id) {
      return user.id;
    }
    
    const pendingUserId = sessionStorage.getItem('pendingUserId') || 
                          localStorage.getItem('pendingUserId');
    if (pendingUserId) {
      return pendingUserId;
    }
    
    if (email) {
      try {
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
          sessionStorage.setItem('pendingUserId', data.id);
          localStorage.setItem('pendingUserId', data.id);
          return data.id;
        }
      } catch (error) {
        console.error("Error in ensureUserAssociation:", error);
      }
    }
    
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
      ensureUserAssociation,
      authInitialized
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
