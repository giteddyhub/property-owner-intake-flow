
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  valid: boolean;
  error?: string;
  submissionId?: string;
}

export const validateSubmission = async (
  userId: string,
  submissionKey: string,
  isImmediateSubmission: boolean = false
): Promise<ValidationResult> => {
  console.log(`[SubmissionValidator] Validating submission for user ${userId}, key: ${submissionKey}`);

  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return {
        valid: false,
        error: "User profile not found. Please ensure your account is properly set up."
      };
    }

    // Check for recent submissions (within last 5 minutes) to prevent duplicates
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentSubmissions, error: recentError } = await supabase
      .from('form_submissions')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentError) {
      console.warn('[SubmissionValidator] Error checking recent submissions:', recentError);
      // Don't fail validation for this error, just log it
    }

    if (recentSubmissions && recentSubmissions.length > 0) {
      console.log('[SubmissionValidator] Recent submission found, preventing duplicate');
      return {
        valid: false,
        error: "A recent submission already exists. Please wait before submitting again.",
        submissionId: recentSubmissions[0].id
      };
    }

    // Check for pending form data in database
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_form_data')
      .select('id, owners, properties, assignments')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingError) {
      console.warn('[SubmissionValidator] Error checking pending data:', pendingError);
      // Don't fail validation for this error
    }

    // Validate that we have the necessary data either in pending_form_data or will be provided
    if (pendingData && pendingData.length > 0) {
      const data = pendingData[0];
      const ownersArray = Array.isArray(data.owners) ? data.owners : [];
      const propertiesArray = Array.isArray(data.properties) ? data.properties : [];
      const assignmentsArray = Array.isArray(data.assignments) ? data.assignments : [];

      if (ownersArray.length === 0 || propertiesArray.length === 0 || assignmentsArray.length === 0) {
        return {
          valid: false,
          error: "Incomplete form data. Please ensure you have added owners, properties, and assignments."
        };
      }
    }

    // For immediate submissions (during signup), skip additional checks
    if (isImmediateSubmission) {
      console.log('[SubmissionValidator] Immediate submission - validation passed');
      return { valid: true };
    }

    // Additional validation can be added here (e.g., rate limiting, business rules)
    
    console.log('[SubmissionValidator] Validation passed for user:', userId);
    return { valid: true };

  } catch (error: any) {
    console.error('[SubmissionValidator] Validation error:', error);
    return {
      valid: false,
      error: `Validation failed: ${error.message}`
    };
  }
};
