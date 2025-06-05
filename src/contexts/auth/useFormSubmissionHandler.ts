
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { submitFormData } from '@/components/form/review/utils/submissionService';
import { toast } from 'sonner';

export const useFormSubmissionHandler = () => {
  const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
  const [submissionCompleted, setSubmissionCompleted] = useState<boolean>(false);
  const [submissionAttempts, setSubmissionAttempts] = useState<number>(0);

  const processPendingFormData = useCallback(async (userId: string) => {
    // Prevent multiple simultaneous submissions
    if (processingSubmission) {
      console.log("[FormSubmissionHandler] Submission already in progress, skipping");
      return;
    }
    
    // Check submission attempts limit
    if (submissionAttempts > 3) {
      console.log("[FormSubmissionHandler] Too many submission attempts, skipping");
      return;
    }
    
    const pendingFormData = sessionStorage.getItem('pendingFormData');
    const submitAfterVerification = sessionStorage.getItem('submitAfterVerification') === 'true';
    const emailJustVerified = sessionStorage.getItem('emailJustVerified') === 'true';
    const processNow = sessionStorage.getItem('processFormDataNow') === 'true';
    
    console.log("[FormSubmissionHandler] Checking conditions:", {
      hasPendingData: !!pendingFormData,
      submitAfterVerification,
      emailJustVerified,
      processNow,
      userId
    });
      
    // Only process if we have data and the right conditions
    if (pendingFormData && (submitAfterVerification || emailJustVerified || processNow)) {
      console.log("[FormSubmissionHandler] Processing pending form data");
      
      try {
        setProcessingSubmission(true);
        setSubmissionAttempts(prev => prev + 1);
        
        const formData = JSON.parse(pendingFormData);
        const { owners, properties, assignments, contactInfo } = formData;
        
        // Validate form data structure
        if (!Array.isArray(owners) || !Array.isArray(properties) || !Array.isArray(assignments)) {
          console.error("[FormSubmissionHandler] Invalid form data structure");
          return;
        }
        
        console.log(`[FormSubmissionHandler] Submitting form data:`, {
          ownersCount: owners.length,
          propertiesCount: properties.length,
          assignmentsCount: assignments.length,
          userId
        });
        
        // Get current user data for contact info
        const { data: { user } } = await supabase.auth.getUser();
        
        const finalContactInfo = {
          fullName: contactInfo?.fullName || user?.user_metadata?.full_name || '',
          email: contactInfo?.email || user?.email || ''
        };
        
        console.log("[FormSubmissionHandler] Using contact info:", finalContactInfo);
        
        // Submit the form data
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
          
          // Clear all session storage flags
          sessionStorage.removeItem('pendingFormData');
          sessionStorage.removeItem('submitAfterVerification');
          sessionStorage.removeItem('emailJustVerified');
          sessionStorage.removeItem('processFormDataNow');
          sessionStorage.removeItem('forceRetrySubmission');
          sessionStorage.removeItem('submissionError');
          
          // Mark as completed
          sessionStorage.setItem('formSubmittedDuringSignup', 'true');
          sessionStorage.setItem('redirectToDashboard', 'true');
          
          console.log("[FormSubmissionHandler] Form submission completed successfully");
          
          toast.success("Your property information has been submitted successfully!");
        } else {
          console.error(`[FormSubmissionHandler] Submission failed:`, result.error);
          
          // Store error and set retry flag
          sessionStorage.setItem('submissionError', result.error || "Submission failed");
          sessionStorage.setItem('forceRetrySubmission', 'true');
        }
      } catch (error: any) {
        console.error("[FormSubmissionHandler] Error submitting form data:", error);
        
        // Set retry flag for future attempts
        sessionStorage.setItem('forceRetrySubmission', 'true');
        sessionStorage.setItem('submissionError', error.message || 'Unknown error occurred');
        
        toast.error("Error submitting your information. We'll retry shortly.");
      } finally {
        setProcessingSubmission(false);
      }
    } else {
      console.log("[FormSubmissionHandler] Conditions not met for form submission");
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
