
import { supabase } from '@/integrations/supabase/client';
import { submissionTracker } from './submissionTracker';
import { toast } from 'sonner';

export interface ValidationResult {
  valid: boolean;
  submissionId?: string;
  error?: string;
}

/**
 * Validates a submission attempt before proceeding
 */
export const validateSubmission = async (
  userId: string,
  submissionKey: string,
  isImmediateSubmission: boolean = false
): Promise<ValidationResult> => {
  console.log(`[submissionValidator] Validating submission ${submissionKey} for user:`, userId);
  
  // Check if this user already has a completed submission
  if (submissionTracker.isCompleted(userId)) {
    console.log(`[submissionValidator] User ${userId} already has a completed submission`);
    
    // Check if we have a stored submission ID to return
    if (submissionTracker.hasSubmissionId(userId)) {
      const submissionId = submissionTracker.getSubmissionId(userId);
      console.log(`[submissionValidator] Returning previously stored submission ID: ${submissionId}`);
      return { 
        valid: true,
        submissionId,
        error: "Your information has already been submitted successfully"
      };
    }
    
    return { 
      valid: true,
      error: "Your information has already been submitted successfully"
    };
  }
  
  // Clear completed flag to force a retry if needed
  if (sessionStorage.getItem('forceRetrySubmission') === 'true') {
    console.log("[submissionValidator] Force retry flag found, clearing completed state");
    submissionTracker.clearCompleted(userId);
    sessionStorage.removeItem('forceRetrySubmission');
  }
  
  // Check if there are too many active submissions (prevents potential spamming)
  if (submissionTracker.getActiveCount() >= 3) {
    console.log("[submissionValidator] Too many active submissions, rejecting new submission");
    return { 
      valid: false, 
      error: "Too many active submissions. Please wait a moment and try again." 
    };
  }
  
  // Check if another submission is already in progress
  if (submissionTracker.isActive(submissionKey)) {
    console.log(`[submissionValidator] Submission ${submissionKey} already in progress`);
    return { 
      valid: false, 
      error: "Another submission is already in progress" 
    };
  }
  
  // Check if we already have a stored submission ID for this user
  if (submissionTracker.hasSubmissionId(userId)) {
    const existingSubmissionId = submissionTracker.getSubmissionId(userId);
    
    // Check if this submission actually exists in the database
    const { data: existingSubmission, error: checkError } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('id', existingSubmissionId)
      .eq('user_id', userId)
      .single();
      
    if (!checkError && existingSubmission) {
      console.log(`[submissionValidator] Found existing submission ID ${existingSubmissionId} for user ${userId}`);
      
      // Return the existing submission ID - no need to create a new one
      return {
        valid: true,
        submissionId: existingSubmissionId
      };
    }
  }
  
  // Skip email verification check for immediate submissions
  if (!isImmediateSubmission) {
    // Only check email verification if not an immediate submission
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("[submissionValidator] Error verifying user:", userError);
      return {
        valid: false,
        error: "Failed to verify user authentication. Please sign in again."
      };
    }
    
    // We no longer fail if email isn't verified, just log a warning
    if (!userData.user.email_confirmed_at && !userData.user.confirmed_at) {
      console.warn("[submissionValidator] User email not verified:", userData.user.email);
    }
  } else {
    console.log("[submissionValidator] Immediate submission - bypassing email verification check");
  }
  
  return { valid: true };
};
