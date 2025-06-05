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
    const emailJustVerified = sessionStorage.getItem('emailJustVerified') === 'true';
    const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
    
    console.log("[FormSubmissionHandler] Processing pending data. Has data:", !!pendingFormData, 
      "Submit after verification:", submitAfterVerification, 
      "Email just verified:", emailJustVerified,
      "Force retry:", forceRetry);
      
    // Only process if we have data and the right conditions
    if (pendingFormData && (submitAfterVerification === 'true' || emailJustVerified || forceRetry)) {
      console.log("[FormSubmissionHandler] Found pending form data with submit conditions met");
      
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
        if (!Array.isArray(owners) || !Array.isArray(properties) || !Array.isArray(assignments)) {
          console.error("[FormSubmissionHandler] Invalid form data:", formData);
          return;
        }
        
        console.log(`[FormSubmissionHandler] Submitting pending form data for user ${userId} with:`, {
          ownersCount: owners.length,
          propertiesCount: properties.length,
          assignmentsCount: assignments.length
        });
        
        // Get fresh user data to ensure contact info is current
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Use form contact info but fallback to user metadata
          const finalContactInfo = {
            fullName: contactInfo?.fullName || user.user_metadata?.full_name || '',
            email: contactInfo?.email || user.email || ''
          };
          
          // Submit the data
          const result = await submitFormData(
            owners,
            properties,
            assignments,
            finalContactInfo,
            userId,
            true // isImmediateSubmission = true
          );
          
          if (result.success) {
            setSubmissionCompleted(true);
            
            // Clear flags after successful submission
            sessionStorage.removeItem('pendingFormData');
            sessionStorage.removeItem('submitAfterVerification');
            sessionStorage.removeItem('emailJustVerified');
            sessionStorage.removeItem('forceRetrySubmission');
            sessionStorage.removeItem('submissionError');
            
            // Mark as completed
            sessionStorage.setItem('formSubmittedDuringSignup', 'true');
            
            console.log("[FormSubmissionHandler] Form submission completed successfully");
            
            toast.success("Your information has been submitted successfully!");
          } else {
            console.error(`[FormSubmissionHandler] Submission failed:`, result.error);
            
            // Store error for display
            sessionStorage.setItem('submissionError', result.error || "Unknown error");
            
            // Keep retry flag if there was an RLS issue
            if (result.error?.includes('security policy') || result.error?.includes('Authorization error')) {
              console.log("[FormSubmissionHandler] Setting retry flag for future attempts");
              sessionStorage.setItem('forceRetrySubmission', 'true');
            }
          }
        }
      } catch (error: any) {
        console.error("[FormSubmissionHandler] Error submitting pending form data:", error);
        
        // Set retry flag for future attempts
        sessionStorage.setItem('forceRetrySubmission', 'true');
        sessionStorage.setItem('submissionError', error.message || 'Unknown error occurred');
      } finally {
        setProcessingSubmission(false);
      }
    } else {
      console.log("[FormSubmissionHandler] No pending form data found or conditions not met");
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
