
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

interface SignUpFormState {
  fullName: string;
  email: string;
  password: string;
  isSubmitting: boolean;
  isSignedUp: boolean;
  hasPendingFormData: boolean;
}

interface UseSignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const useSignUpForm = ({ onSuccess, redirectAfterAuth = false }: UseSignUpFormProps) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<SignUpFormState>({
    fullName: '',
    email: '',
    password: '',
    isSubmitting: false,
    isSignedUp: false,
    hasPendingFormData: false
  });

  // Check for pending form data on component mount
  useEffect(() => {
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    setFormState(prev => ({
      ...prev,
      hasPendingFormData: !!pendingFormDataStr
    }));
  }, []);

  const updateField = (field: keyof Pick<SignUpFormState, 'fullName' | 'email' | 'password'>, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { fullName, email, password, isSubmitting } = formState;
    
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    // Prevent double submissions
    if (isSubmitting) {
      return;
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Check if we have pending form data to submit immediately
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      
      // First create the user account regardless of whether there's pending form data
      const { error, data } = await signUp(email, password, fullName);
      
      if (error) {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }
      
      // We successfully created the user
      if (pendingFormDataStr && data?.user?.id) {
        try {
          // Parse the pending form data
          const pendingFormData = JSON.parse(pendingFormDataStr);
          
          // Update contact info with user information
          if (!pendingFormData.contactInfo) {
            pendingFormData.contactInfo = {};
          }
          pendingFormData.contactInfo.fullName = fullName;
          pendingFormData.contactInfo.email = email;
          
          // Store updated form data back in session storage
          sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
          
          // Set flag to force submission after email verification
          sessionStorage.setItem('submitAfterVerification', 'true');
          
          // Store user ID for the verification page to use
          sessionStorage.setItem('pendingUserId', data.user.id);
          console.log("[SignUpForm] User created with ID:", data.user.id, "- form data saved for submission after verification");
          
          // Set flag to indicate the form should be submitted during signup flow
          sessionStorage.setItem('formSubmittedDuringSignup', 'true');
        } catch (parseError) {
          console.error("[SignUpForm] Error processing pending form data:", parseError);
          // Don't show error to the user as the account was still created successfully
        }
      }

      // Set success state
      setFormState(prev => ({ ...prev, isSignedUp: true }));
      
      // Save email in session storage for the verification page
      sessionStorage.setItem('pendingUserEmail', email);
      
      // Store pendingUserId for use after email verification
      if (data?.user?.id) {
        sessionStorage.setItem('pendingUserId', data.user.id);
      }
      
      // Add flag for direct redirect to dashboard after email verification
      sessionStorage.setItem('directDashboardRedirect', 'true');
      
      // Only call onSuccess if redirectAfterAuth is false
      if (onSuccess && !redirectAfterAuth) {
        // Small delay to show the confirmation message
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
      
      if (redirectAfterAuth) {
        // Redirect to the verify email page
        setTimeout(() => {
          navigate('/verify-email');
        }, 1500);
      }
    } catch (error: any) {
      console.error('[SignUpForm] Error signing up:', error);
      toast.error('An error occurred while creating your account');
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    formState,
    updateField,
    handleSubmit
  };
};
