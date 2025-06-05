
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePendingFormData } from './usePendingFormData';

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
  const { savePendingFormData } = usePendingFormData();
  
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

      // Check for pending form data and save it with user info
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      if (pendingFormDataStr) {
        try {
          const pendingFormData = JSON.parse(pendingFormDataStr);
          const { owners, properties, assignments, contactInfo } = pendingFormData;
          
          console.log("[ImprovedSignUpForm] Found pending form data, saving with contact info");
          
          // Update contact info with signup details
          const updatedContactInfo = {
            ...contactInfo,
            fullName,
            email
          };

          // Save to sessionStorage with updated contact info for later submission
          const updatedFormData = {
            owners,
            properties,
            assignments,
            contactInfo: updatedContactInfo
          };
          
          sessionStorage.setItem('pendingFormData', JSON.stringify(updatedFormData));
          
          // Set flag to submit after email verification
          sessionStorage.setItem('submitAfterVerification', 'true');
          
          console.log("[ImprovedSignUpForm] Updated pending form data with contact info");
          
        } catch (error) {
          console.error("[ImprovedSignUpForm] Error processing pending form data:", error);
        }
      }

      // Set success state
      setFormState(prev => ({ ...prev, isSignedUp: true }));
      
      // Save email and user ID for verification page
      sessionStorage.setItem('pendingUserEmail', email);
      sessionStorage.setItem('pendingUserId', userId);
      
      if (onSuccess && !redirectAfterAuth) {
        setTimeout(onSuccess, 2000);
      }
      
      if (redirectAfterAuth) {
        setTimeout(() => {
          navigate('/verify-email');
        }, 1500);
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
