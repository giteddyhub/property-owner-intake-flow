
import { useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { useAuth } from '@/contexts/AuthContext';
import { submitFormData } from '@/components/form/review/submitUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useSubmissionHandler = (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[]
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const { user, processingSubmission, setProcessingSubmission, submissionCompleted } = useAuth();
  const navigate = useNavigate();

  const storeFormDataInSession = () => {
    // Store form data in sessionStorage so we can access it post-authentication
    const pendingFormData = {
      owners,
      properties,
      assignments,
      contactInfo: {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      }
    };
    
    // Validate data before storing
    if (!Array.isArray(owners) || !Array.isArray(properties) || !Array.isArray(assignments)) {
      toast.error("Invalid form data. Please try again.");
      console.error("[useSubmissionHandler] Invalid form data structure:", { owners, properties, assignments });
      return false;
    }
    
    console.log("[useSubmissionHandler] Storing pending form data with counts:", {
      owners: owners.length,
      properties: properties.length,
      assignments: assignments.length
    });
    
    // Store the pending form data
    sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
    return true;
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    console.log("[useSubmissionHandler] handleSubmit with user:", user?.id || "not logged in");
    
    if (!user) {
      toast.error("You must be logged in to submit your information");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setProcessingSubmission(true);
      setSubmissionInProgress(true);
      setSubmissionAttempted(true);
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };
      
      console.log("[useSubmissionHandler] Submitting form data with user ID:", user.id);
      
      // Pass the user ID explicitly to ensure it's associated with the submission
      const result = await submitFormData(owners, properties, assignments, contactInfo, user.id);
      
      if (!result.success) {
        throw new Error(result.error || "Unknown submission error");
      }
      
      // Clear form data to prevent duplicate submissions
      sessionStorage.removeItem('pendingFormData');
      sessionStorage.removeItem('submitAfterVerification');
      sessionStorage.removeItem('redirectToDashboard');
      sessionStorage.setItem('formSubmittedDuringSignup', 'true');
      
      // Notify user of success
      toast.success("Your information has been submitted successfully!");
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error("[useSubmissionHandler] Error during submission:", error);
      toast.error(error.message || 'There was an error submitting your information. Please try again.');
      
      // If the error is related to authorization, we might need to redirect to verification
      if (error.message?.includes('Authorization error') || 
          error.message?.includes('violates row-level security policy')) {
        
        toast.info("You may need to verify your email. Redirecting to verification page...");
        sessionStorage.setItem('submitAfterVerification', 'true');
        
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
      setProcessingSubmission(false);
      setSubmissionInProgress(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    submissionInProgress,
    setSubmissionInProgress,
    submissionAttempted,
    setSubmissionAttempted,
    handleSubmit,
    storeFormDataInSession
  };
};
