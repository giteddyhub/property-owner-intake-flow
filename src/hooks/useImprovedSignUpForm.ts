
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePendingFormData } from './usePendingFormData';
import { submitFormDataImproved } from '@/components/form/review/utils/improvedSubmissionService';

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
  const { loadPendingFormData, completePendingFormData, savePendingFormData } = usePendingFormData();
  
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
      
      // First create the user account
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

      // Check for pending form data and submit immediately if available
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      if (pendingFormDataStr) {
        try {
          const pendingFormData = JSON.parse(pendingFormDataStr);
          const { owners, properties, assignments, contactInfo } = pendingFormData;
          
          console.log("[ImprovedSignUpForm] Found pending form data, submitting immediately");
          
          // Update contact info with signup details
          const updatedContactInfo = {
            ...contactInfo,
            fullName,
            email
          };

          // Validate that we have actual form data
          if (Array.isArray(owners) && Array.isArray(properties) && Array.isArray(assignments) &&
              owners.length > 0 && properties.length > 0 && assignments.length > 0) {
            
            // Save to database first
            const pendingId = await savePendingFormData(
              owners, 
              properties, 
              assignments, 
              updatedContactInfo, 
              userId
            );

            // Submit the form data immediately (skip email verification requirement)
            const result = await submitFormDataImproved(
              owners,
              properties,
              assignments,
              updatedContactInfo,
              userId,
              {
                validateData: true,
                preventDuplicates: true,
                skipEmailVerification: true
              }
            );

            if (result.success) {
              // Mark pending data as completed
              if (pendingId) {
                await completePendingFormData(userId, pendingId);
              }

              toast.success("Account created and form submitted successfully!", {
                description: "Please check your email to verify your account."
              });

              // Store submission details
              if (result.submissionId) {
                sessionStorage.setItem('submissionId', result.submissionId);
              }
              if (result.purchaseId) {
                sessionStorage.setItem('purchaseId', result.purchaseId);
              }

              // Set flags for successful completion
              sessionStorage.setItem('formSubmittedDuringSignup', 'true');
              sessionStorage.setItem('directDashboardRedirect', 'true');
            } else {
              console.warn("[ImprovedSignUpForm] Form submission failed:", result.error);
              toast.warning("Account created successfully, but form submission encountered an issue. Please try submitting again after email verification.");
            }
          } else {
            console.warn("[ImprovedSignUpForm] Invalid pending form data structure");
            toast.warning("Account created successfully. Please complete the form again.");
          }
        } catch (error) {
          console.error("[ImprovedSignUpForm] Error processing pending form data:", error);
          toast.warning("Account created successfully. Please complete the form again.");
        }
      }

      // Set success state
      setFormState(prev => ({ ...prev, isSignedUp: true }));
      
      // Save email for verification page
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
