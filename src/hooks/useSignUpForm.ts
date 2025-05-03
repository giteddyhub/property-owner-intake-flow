
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { submitFormData } from '@/components/form/review/submitUtils';

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
      if (pendingFormDataStr) {
        try {
          // Update the pending form data with user information
          const pendingFormData = JSON.parse(pendingFormDataStr);
          if (!pendingFormData.contactInfo) {
            pendingFormData.contactInfo = {};
          }
          
          pendingFormData.contactInfo.fullName = fullName;
          pendingFormData.contactInfo.email = email;
          
          // CRITICAL CHANGE: Submit the form data immediately during signup
          console.log("[SignUpForm] Attempting immediate form submission before verification");
          
          // First create the user account
          const { error, data } = await signUp(email, password, fullName);
          
          if (error) {
            toast.error(error.message);
            return;
          }
          
          // We have a user, now submit the form data directly
          if (data?.user?.id) {
            const userId = data.user.id;
            console.log("[SignUpForm] User created with ID:", userId, "submitting form data");
            
            // Submit the form data with the new user ID
            const { owners, properties, assignments, contactInfo } = pendingFormData;
            
            // Update contact info with the user's information
            contactInfo.fullName = fullName;
            contactInfo.email = email;
            
            const result = await submitFormData(owners, properties, assignments, contactInfo, userId);
            
            if (result.success) {
              console.log("[SignUpForm] Form data submitted successfully:", result);
              // Set flag to indicate the form was submitted during signup
              sessionStorage.setItem('formSubmittedDuringSignup', 'true');
              // Clear the pendingFormData as it's now submitted
              sessionStorage.removeItem('pendingFormData');
              toast.success("Your information has been submitted successfully!");
            } else {
              console.warn("[SignUpForm] Form submission failed:", result.error);
            }
          }
          
          toast.success('Account created successfully! Please check your email to verify your account.');
          setFormState(prev => ({ ...prev, isSignedUp: true }));
          
          // Save email in session storage for the verification page
          sessionStorage.setItem('pendingUserEmail', email);
          
          // Store pendingUserId for use after email verification
          if (data?.user?.id) {
            sessionStorage.setItem('pendingUserId', data.user.id);
          }
          
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
        } catch (parseError) {
          console.error("[SignUpForm] Error processing submission:", parseError);
          toast.error("There was a problem processing your submission");
          
          // Fall back to normal signup flow
          const { error } = await signUp(email, password, fullName);
          if (error) {
            toast.error(error.message);
          } else {
            setFormState(prev => ({ ...prev, isSignedUp: true }));
            toast.success('Account created successfully! Please check your email to verify your account.');
          }
        }
      } else {
        // No pending form data, just sign up normally
        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.');
          setFormState(prev => ({ ...prev, isSignedUp: true }));
          
          // Save email in session storage for the verification page
          sessionStorage.setItem('pendingUserEmail', email);
          
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
        }
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
