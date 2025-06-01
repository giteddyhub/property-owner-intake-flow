
import { useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { useAuth } from '@/contexts/auth/AuthContext';
import { submitFormDataImproved } from '@/components/form/review/utils/improvedSubmissionService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePendingFormData } from '@/hooks/usePendingFormData';

export const useImprovedSubmissionHandler = (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[]
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { completePendingFormData, loadPendingFormData } = usePendingFormData();

  const handleSubmit = async () => {
    if (isSubmitting || !user) {
      if (!user) {
        toast.error("You must be logged in to submit your information");
      }
      return;
    }

    console.log("[ImprovedSubmissionHandler] Starting submission for user:", user.id);
    
    try {
      setIsSubmitting(true);
      setSubmissionAttempted(true);
      
      // Get user information for contact info
      let contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };

      // Try to load any pending form data to get complete contact info
      const pendingData = await loadPendingFormData(user.id);
      if (pendingData?.contact_info) {
        contactInfo = {
          fullName: pendingData.contact_info.fullName || contactInfo.fullName,
          email: pendingData.contact_info.email || contactInfo.email
        };
      }

      console.log("[ImprovedSubmissionHandler] Submitting with contact info:", contactInfo);
      
      // Submit using the improved service
      const result = await submitFormDataImproved(
        owners,
        properties,
        assignments,
        contactInfo,
        user.id,
        {
          validateData: true,
          preventDuplicates: true,
          skipEmailVerification: false
        }
      );
      
      if (!result.success) {
        throw new Error(result.error || "Unknown submission error");
      }

      // Mark any pending data as completed
      if (pendingData?.id) {
        await completePendingFormData(user.id, pendingData.id);
      }
      
      console.log("[ImprovedSubmissionHandler] Submission successful:", result.submissionId);
      
      // Clear session storage flags
      sessionStorage.removeItem('pendingFormData');
      sessionStorage.removeItem('submitAfterVerification');
      sessionStorage.removeItem('redirectToDashboard');
      sessionStorage.setItem('formSubmittedDuringSignup', 'true');
      
      // Show success and redirect
      toast.success("Your information has been submitted successfully!");
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error("[ImprovedSubmissionHandler] Submission error:", error);
      toast.error(error.message || 'There was an error submitting your information. Please try again.');
      
      // Handle specific error cases
      if (error.message?.includes('Authorization error') || 
          error.message?.includes('violates row-level security policy')) {
        
        toast.info("You may need to verify your email. Redirecting to verification page...");
        
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submissionAttempted,
    handleSubmit
  };
};
