
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVerificationMonitor = (
  verificationStatus: string, 
  setVerificationStatus: (status: 'pending'|'verified'|'failed') => void,
  redirecting: boolean,
  formSubmittedDuringSignup: boolean,
  user: any
) => {
  const navigate = useNavigate();

  // Monitor authentication state
  useEffect(() => {
    // Skip the rest of this effect if we're already redirecting
    if (redirecting) return;
    
    console.log("[useVerificationMonitor] Component mounted, current user:", user?.id);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useVerificationMonitor] Auth state change:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          console.log("[useVerificationMonitor] Email confirmed, user is verified");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages if we already displayed them elsewhere
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard shortly after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[useVerificationMonitor] Token refreshed, checking email verification status");
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    });
    
    // Check if user is already verified on mount
    if (user?.email_confirmed_at || user?.confirmed_at) {
      console.log("[useVerificationMonitor] User already verified on mount");
      setVerificationStatus('verified');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    // Check session every 5 seconds to detect email verification
    const checkInterval = setInterval(async () => {
      if (verificationStatus === 'verified') return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email_confirmed_at || data.session?.user?.confirmed_at) {
          console.log("[useVerificationMonitor] Email verified detected in interval check");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error("[useVerificationMonitor] Error checking session:", error);
      }
    }, 5000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    }
  }, [navigate, user, verificationStatus, formSubmittedDuringSignup, redirecting, setVerificationStatus]);
};
