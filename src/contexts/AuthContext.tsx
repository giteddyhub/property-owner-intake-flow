
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
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update session and user state immediately for UI responsiveness
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // User has signed in
          toast.success("Successfully signed in!");
          
          if (session?.user?.id) {
            // Store the user ID in both sessionStorage and localStorage for persistence
            sessionStorage.setItem('pendingUserId', session.user.id);
            localStorage.setItem('pendingUserId', session.user.id);
            
            if (session.user.email) {
              // Store email for recovery purposes
              sessionStorage.setItem('userEmail', session.user.email);
              localStorage.setItem('userEmail', session.user.email);
              
              // Check if we have a pending contact to associate
              const contactId = sessionStorage.getItem('contactId') || localStorage.getItem('contactId');
              
              if (contactId) {
                console.log("Found pending contactId to update with user ID:", contactId);
                
                // Attempt to update the contact with the user's ID
                try {
                  const { error: updateError } = await supabase
                    .from('contacts')
                    .update({ user_id: session.user.id })
                    .eq('id', contactId);
                    
                  if (updateError) {
                    console.error("Error updating contact with user ID:", updateError);
                  } else {
                    console.log("Successfully updated contact with user ID");
                    
                    // After updating contact, also update related owners, properties, and assignments
                    // This ensures all related data is properly associated with the user
                    await associateOrphanedDataWithContactId(contactId, session.user.id);
                  }
                } catch (error) {
                  console.error("Exception while updating contact with user ID:", error);
                }
              }
              
              // Import and run data association after a slight delay
              // This is to ensure all auth processes have completed
              setTimeout(async () => {
                try {
                  const { associateOrphanedData } = await import('@/hooks/dashboard/mappers/assignmentMapper');
                  const result = await associateOrphanedData(session.user.id, session.user.email);
                  if (result.success) {
                    toast.success(`Successfully associated your previous submissions with your account`);
                  }
                } catch (err) {
                  console.error("Error associating data:", err);
                }
              }, 1500);
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
        
        if (session.user.email) {
          sessionStorage.setItem('userEmail', session.user.email);
          localStorage.setItem('userEmail', session.user.email);
        }
        
        // Check if we have a pending contact to associate
        const contactId = sessionStorage.getItem('contactId') || localStorage.getItem('contactId');
        if (contactId) {
          console.log("Found pending contactId during initial load:", contactId);
          // The update will be handled in the onAuthStateChange event
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to associate orphaned data with contact ID
  const associateOrphanedDataWithContactId = async (contactId: string, userId: string) => {
    try {
      console.log(`Associating all data for contact ${contactId} with user ${userId}`);
      
      // Update owners
      const { error: ownersError } = await supabase
        .from('owners')
        .update({ user_id: userId })
        .eq('contact_id', contactId)
        .is('user_id', null);
        
      if (ownersError) {
        console.error("Error updating owners:", ownersError);
      }
      
      // Update properties
      const { error: propertiesError } = await supabase
        .from('properties')
        .update({ user_id: userId })
        .eq('contact_id', contactId)
        .is('user_id', null);
        
      if (propertiesError) {
        console.error("Error updating properties:", propertiesError);
      }
      
      // Update assignments
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
    
    // Store email in sessionStorage before signup for recovery purposes
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
    
    // If signup is successful, store the user ID
    if (response.data?.user?.id) {
      console.log("Setting user ID in storage for new signup:", response.data.user.id);
      sessionStorage.setItem('pendingUserId', response.data.user.id);
      localStorage.setItem('pendingUserId', response.data.user.id);
      
      // Check if we have any form submission data that needs to be preserved
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
            
            // Also update related data
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
    // Clear stored user IDs
    sessionStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserId');
    
    await supabase.auth.signOut();
  };
  
  // Helper function to ensure user data is properly associated
  const ensureUserAssociation = async (email: string): Promise<string | null> => {
    // First check if we have a current authenticated user
    if (user?.id) {
      console.log("Using current authenticated user ID:", user.id);
      return user.id;
    }
    
    // Next check if we have a pending user ID in storage
    const pendingUserId = sessionStorage.getItem('pendingUserId') || 
                          localStorage.getItem('pendingUserId');
    if (pendingUserId) {
      console.log("Using pending user ID from storage:", pendingUserId);
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
    console.log("No user association found for email:", email);
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
