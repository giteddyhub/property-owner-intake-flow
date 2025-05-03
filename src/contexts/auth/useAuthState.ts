
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    console.log("[AuthState] Setting up auth state listener");
    
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthState] Auth state changed:", event, "User:", session?.user?.id);
        setUser(session?.user || null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthState] Initial session check:", session?.user?.id || "No session");
      setUser(session?.user || null);
      setIsInitialized(true);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user, 
    setUser,
    loading, 
    isInitialized
  };
};
