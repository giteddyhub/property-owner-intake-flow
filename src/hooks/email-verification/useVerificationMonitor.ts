
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

  // Monitor authentication state and handle verification
  useEffect(() => {
    if (redirecting) return;
    
    console.log("[useVerificationMonitor] Setting up auth listener, current user:", user?.id);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useVerificationMonitor] Auth state change:", event, "Email confirmed:", !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at));
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const isVerified = session?.user?.email_confirmed_at || session?.user?.confirmed_at;
        
        if (isVerified && verificationStatus !== 'verified') {
          console.log("[useVerificationMonitor] Email verification detected!");
          setVerificationStatus('verified');
          
          if (session?.user) {
            // Update user profile with contact info immediately
            await updateUserProfile(session.user.id);
            
            // Process form data after profile update
            await processFormDataAfterVerification(session.user.id);
          }
          
          toast.success("Email verified successfully!");
          
          // Redirect to dashboard after processing
          setTimeout(() => {
            console.log("[useVerificationMonitor] Redirecting to dashboard after verification");
            sessionStorage.setItem('showSuccessMessage', 'true');
            navigate('/dashboard');
          }, 2000);
        }
      }
    });
    
    // Check if user is already verified on mount
    if (user?.email_confirmed_at || user?.confirmed_at) {
      console.log("[useVerificationMonitor] User already verified on mount");
      setVerificationStatus('verified');
      
      updateUserProfile(user.id);
      processFormDataAfterVerification(user.id);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, user, verificationStatus, redirecting, setVerificationStatus]);
};

// Update user profile with contact info from session storage or form data
const updateUserProfile = async (userId: string) => {
  try {
    // Get contact info from session storage
    const pendingEmail = sessionStorage.getItem('pendingUserEmail');
    const pendingFullName = sessionStorage.getItem('pendingUserFullName');
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    
    let contactInfo = {
      email: pendingEmail || '',
      fullName: pendingFullName || ''
    };
    
    // If we have form data, use contact info from there
    if (pendingFormDataStr) {
      try {
        const formData = JSON.parse(pendingFormDataStr);
        if (formData.contactInfo) {
          contactInfo = {
            email: formData.contactInfo.email || contactInfo.email,
            fullName: formData.contactInfo.fullName || contactInfo.fullName
          };
        }
      } catch (e) {
        console.warn("[updateUserProfile] Error parsing form data:", e);
      }
    }
    
    if (contactInfo.email || contactInfo.fullName) {
      console.log("[updateUserProfile] Updating profile with:", contactInfo);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: contactInfo.email,
          full_name: contactInfo.fullName,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (error) {
        console.error("[updateUserProfile] Error updating profile:", error);
      } else {
        console.log("[updateUserProfile] Profile updated successfully");
      }
    }
  } catch (error) {
    console.error("[updateUserProfile] Error:", error);
  }
};

// Process form data submission after email verification
const processFormDataAfterVerification = async (userId: string) => {
  try {
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    const shouldSubmit = sessionStorage.getItem('submitAfterVerification') === 'true';
    
    if (pendingFormDataStr && shouldSubmit) {
      console.log("[processFormDataAfterVerification] Processing form data for user:", userId);
      
      // Set flag to trigger form submission in AuthContext
      sessionStorage.setItem('emailJustVerified', 'true');
      sessionStorage.setItem('processFormDataNow', 'true');
      
      console.log("[processFormDataAfterVerification] Flags set for form submission");
    }
  } catch (error) {
    console.error("[processFormDataAfterVerification] Error:", error);
  }
};
