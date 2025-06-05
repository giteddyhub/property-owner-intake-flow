
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useVerificationMonitor] Auth state change:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          console.log("[useVerificationMonitor] Email confirmed, user is verified");
          setVerificationStatus('verified');
          
          // Update user profile with contact info from form data
          if (session.user) {
            await updateUserProfileFromFormData(session.user.id);
          }
          
          toast.success("Email verified successfully!");
          
          // Check if we should submit form data
          const shouldSubmitForm = sessionStorage.getItem('submitAfterVerification') === 'true';
          if (shouldSubmitForm) {
            console.log("[useVerificationMonitor] Email verified, will trigger form submission");
            sessionStorage.setItem('emailJustVerified', 'true');
          }
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[useVerificationMonitor] Token refreshed, checking email verification status");
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          setVerificationStatus('verified');
          
          // Update user profile
          if (session.user) {
            await updateUserProfileFromFormData(session.user.id);
          }
          
          toast.success("Email verified successfully!");
          
          // Check if we should submit form data
          const shouldSubmitForm = sessionStorage.getItem('submitAfterVerification') === 'true';
          if (shouldSubmitForm) {
            sessionStorage.setItem('emailJustVerified', 'true');
          }
          
          // Redirect to dashboard
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
      
      // Update profile and redirect
      updateUserProfileFromFormData(user.id);
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
          
          // Update user profile
          if (data.session.user) {
            await updateUserProfileFromFormData(data.session.user.id);
          }
          
          toast.success("Email verified successfully!");
          
          // Set flag for form submission
          const shouldSubmitForm = sessionStorage.getItem('submitAfterVerification') === 'true';
          if (shouldSubmitForm) {
            sessionStorage.setItem('emailJustVerified', 'true');
          }
          
          // Redirect to dashboard
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

// Helper function to update user profile from form data
const updateUserProfileFromFormData = async (userId: string) => {
  try {
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    if (pendingFormDataStr) {
      const formData = JSON.parse(pendingFormDataStr);
      const contactInfo = formData.contactInfo;
      
      if (contactInfo?.fullName || contactInfo?.email) {
        console.log("[useVerificationMonitor] Updating user profile with form contact info");
        
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: contactInfo.fullName,
            email: contactInfo.email,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          
        if (error) {
          console.error("[useVerificationMonitor] Error updating profile:", error);
        } else {
          console.log("[useVerificationMonitor] Profile updated successfully");
        }
      }
    }
  } catch (error) {
    console.error("[useVerificationMonitor] Error updating profile from form data:", error);
  }
};
