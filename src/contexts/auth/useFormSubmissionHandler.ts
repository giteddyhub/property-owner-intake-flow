
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { submitFormData } from '@/components/form/review/utils/submissionService';
import { toast } from 'sonner';

export const useFormSubmissionHandler = () => {
  const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);
  const [submissionAttempts, setSubmissionAttempts] = useState<number>(0);

  const processPendingFormData = useCallback(async (userId: string) => {
    // Skip processing if we've already attempted too many times
    if (submissionAttempts > 3) {
      console.log("[FormSubmissionHandler] Too many submission attempts, skipping");
      return;
    }
    
    const pendingFormData = sessionStorage.getItem('pendingFormData');
    const submitAfterVerification = sessionStorage.getItem('submitAfterVerification');
    const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
    const formAlreadySubmitted = sessionStorage.getItem('formSubmittedDuringSignup') === 'true' && 
                                !sessionStorage.getItem('pendingFormData');
    
    console.log("[FormSubmissionHandler] Processing pending data. Has data:", !!pendingFormData, 
      "Submit after verification:", submitAfterVerification, 
      "Force retry:", forceRetry,
      "Already submitted:", formAlreadySubmitted);
      
    // Don't process if already submitted successfully and no pending data
    if (formAlreadySubmitted && !pendingFormData && !forceRetry) {
      console.log("[FormSubmissionHandler] No pending form data but marked as submitted, skipping");
      return;
    }
    
    if (pendingFormData && (submitAfterVerification === 'true' || forceRetry)) {
      console.log("[FormSubmissionHandler] Found pending form data with submit flag or force retry");
      
      // Prevent processing if already handling a submission
      if (processingSubmission) {
        console.log("[FormSubmissionHandler] Submission already in progress, skipping");
        return;
      }
      
      try {
        setProcessingSubmission(true);
        setSubmissionAttempts(prev => prev + 1);
        
        const formData = JSON.parse(pendingFormData);
        const { owners, properties, assignments, contactInfo } = formData;
        
        // Make sure we have actual data to submit
        if (!Array.isArray(owners) || !Array.isArray(properties)) {
          console.error("[FormSubmissionHandler] Invalid form data:", formData);
          return;
        }
        
        console.log(`[FormSubmissionHandler] Submitting pending form data for user ${userId} with:`, {
          ownersCount: owners.length,
          propertiesCount: properties.length,
          assignmentsCount: assignments.length
        });
        
        // Ensure contact info has user's email and name if available
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          if (!contactInfo.fullName && data.user.user_metadata?.full_name) {
            contactInfo.fullName = data.user.user_metadata.full_name;
          }
          
          if (!contactInfo.email && data.user.email) {
            contactInfo.email = data.user.email;
          }
        }
        
        // Submit the data with explicit userId
        const result = await submitFormData(
          owners,
          properties,
          assignments,
          contactInfo,
          userId,
          true // Set isImmediateSubmission to true to bypass verification checks
        );
        
        if (result.success) {
          setSubmissionCompleted(true);
          // Mark form as submitted to prevent duplicate submissions
          sessionStorage.setItem('formSubmittedDuringSignup', 'true');
          // Clear flags after successful submission
          sessionStorage.removeItem('pendingFormData');
          sessionStorage.removeItem('submitAfterVerification');
          sessionStorage.removeItem('forceRetrySubmission');
          sessionStorage.removeItem('submissionError');
          console.log("[FormSubmissionHandler] Form submission completed successfully");
          
          // Don't show another success notification since the user is already receiving multiple messages
          // Only show this if we're retrying a previously failed submission
          if (forceRetry) {
            toast.success("Your information has been submitted successfully!");
          }
        } else {
          console.error(`[FormSubmissionHandler] Submission failed:`, result.error);
          
          // Store error for display on verification page
          sessionStorage.setItem('submissionError', result.error || "Unknown error");
          
          // Keep retry flag if there was an RLS issue
          if (result.error?.includes('security policy') || result.error?.includes('Authorization error')) {
            console.log("[FormSubmissionHandler] Setting retry flag for future attempts");
            sessionStorage.setItem('forceRetrySubmission', 'true');
            
            // Don't show error toast since the verify page will handle this
          }
        }
      } catch (error: any) {
        console.error("[FormSubmissionHandler] Error submitting pending form data:", error);
        
        // Set retry flag for future attempts
        sessionStorage.setItem('forceRetrySubmission', 'true');
      } finally {
        setProcessingSubmission(false);
      }
    } else {
      console.log("[FormSubmissionHandler] No pending form data found or no submission flag");
    }
  }, [processingSubmission, submissionAttempts]);

  return {
    processingSubmission,
    setProcessingSubmission,
    submissionCompleted,
    setSubmissionCompleted,
    submissionAttempts,
    processPendingFormData
  };
};
