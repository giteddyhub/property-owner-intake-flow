
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

interface UseImprovedSignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const useImprovedSignUpForm = ({ onSuccess, redirectAfterAuth = false }: UseImprovedSignUpFormProps) => {
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
    
    if (isSubmitting) {
      return;
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      console.log("[ImprovedSignUpForm] Starting signup process for:", email);
      
      // Create the user account
      const { error, data } = await signUp(email, password, fullName);
      
      if (error) {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      if (!data?.user?.id) {
        toast.error('Account creation failed - no user ID returned');
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      const userId = data.user.id;
      console.log("[ImprovedSignUpForm] User created successfully:", userId);

      // Always save contact info and prepare form data for verification
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      
      if (pendingFormDataStr) {
        try {
          const pendingFormData = JSON.parse(pendingFormDataStr);
          
          // Update form data with user contact info
          const updatedFormData = {
            ...pendingFormData,
            contactInfo: {
              ...pendingFormData.contactInfo,
              fullName,
              email
            },
            userId: userId // Store user ID with form data
          };
          
          sessionStorage.setItem('pendingFormData', JSON.stringify(updatedFormData));
          sessionStorage.setItem('submitAfterVerification', 'true');
          
          console.log("[ImprovedSignUpForm] Updated pending form data with contact info and user ID");
          
        } catch (error) {
          console.error("[ImprovedSignUpForm] Error processing pending form data:", error);
        }
      }

      // Store user info for verification page
      sessionStorage.setItem('pendingUserEmail', email);
      sessionStorage.setItem('pendingUserId', userId);
      sessionStorage.setItem('pendingUserFullName', fullName);
      
      // Set success state briefly
      setFormState(prev => ({ ...prev, isSignedUp: true }));
      
      // Always redirect to verify email page after a short delay
      setTimeout(() => {
        console.log("[ImprovedSignUpForm] Redirecting to verify email page");
        navigate('/verify-email');
      }, 1500);

      if (onSuccess && !redirectAfterAuth) {
        setTimeout(onSuccess, 1000);
      }

    } catch (error: any) {
      console.error('[ImprovedSignUpForm] Error during signup:', error);
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
