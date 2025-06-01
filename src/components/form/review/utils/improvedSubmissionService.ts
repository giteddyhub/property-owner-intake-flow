
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import type { ContactInfo, SubmissionResult } from './types';
import { createFormSubmission, createPurchaseEntry, saveFormData } from './databaseService';
import { logUserActivity } from './activityLoggingService';

interface ImprovedSubmissionOptions {
  validateData?: boolean;
  preventDuplicates?: boolean;
  skipEmailVerification?: boolean;
}

export const submitFormDataImproved = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo,
  userId: string,
  options: ImprovedSubmissionOptions = {}
): Promise<SubmissionResult> => {
  const {
    validateData = true,
    preventDuplicates = true,
    skipEmailVerification = false
  } = options;

  const submissionKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[ImprovedSubmission] Starting submission ${submissionKey} for user:`, userId);
  console.log(`[ImprovedSubmission] Data counts:`, {
    owners: owners.length,
    properties: properties.length,
    assignments: assignments.length
  });

  // Validate user ID
  if (!userId) {
    const error = "User ID is required for form submission";
    console.error(`[ImprovedSubmission] ${error}`);
    return { success: false, error };
  }

  // Validate form data if requested
  if (validateData) {
    if (!owners.length || !properties.length || !assignments.length) {
      const error = "Form data is incomplete - missing owners, properties, or assignments";
      console.error(`[ImprovedSubmission] ${error}`);
      return { success: false, error };
    }

    // Use database validation function
    try {
      const { data: isValid, error: validationError } = await supabase
        .rpc('validate_form_submission_data', {
          owners_data: owners,
          properties_data: properties,
          assignments_data: assignments
        });

      if (validationError || !isValid) {
        const error = `Form data validation failed: ${validationError?.message || 'Invalid data structure'}`;
        console.error(`[ImprovedSubmission] ${error}`);
        return { success: false, error };
      }
    } catch (error: any) {
      console.error(`[ImprovedSubmission] Validation error:`, error);
      return { success: false, error: `Validation failed: ${error.message}` };
    }
  }

  // Check for duplicate submissions if requested
  if (preventDuplicates) {
    const { data: existingSubmissions } = await supabase
      .from('form_submissions')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    if (existingSubmissions && existingSubmissions.length > 0) {
      console.log(`[ImprovedSubmission] Recent submission found, preventing duplicate`);
      return {
        success: true,
        submissionId: existingSubmissions[0].id,
        error: "A recent submission already exists for this user"
      };
    }
  }

  try {
    // Store counts for pricing calculation
    sessionStorage.setItem('ownersCount', String(owners.length));
    sessionStorage.setItem('propertiesCount', String(properties.length));
    
    // Check if any property has document retrieval service
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));

    // Step 1: Create form submission entry
    const { submissionId, error: submissionError } = await createFormSubmission(userId, hasDocumentRetrievalService);
    
    if (submissionError) {
      throw submissionError;
    }

    console.log(`[ImprovedSubmission] Created submission with ID:`, submissionId);
    sessionStorage.setItem('submissionId', submissionId);

    // Step 2: Update user profile with contact information
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: contactInfo.fullName,
          email: contactInfo.email,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.warn(`[ImprovedSubmission] Profile update failed:`, profileError);
      // Don't fail the submission for profile update errors
    }

    // Step 3: Save form data (owners, properties, assignments) in a transaction-like manner
    const { success: saveSuccess, error: saveError } = await saveFormData(
      owners, 
      properties, 
      assignments, 
      submissionId, 
      userId
    );

    if (!saveSuccess || saveError) {
      // If saving failed, try to clean up the submission
      await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId);
      
      throw saveError || new Error("Failed to save form data");
    }

    // Step 4: Create purchase entry
    const { purchaseId, error: purchaseError } = await createPurchaseEntry(submissionId, hasDocumentRetrievalService);
    
    if (purchaseError) {
      console.warn(`[ImprovedSubmission] Purchase entry creation failed:`, purchaseError);
      // Don't fail the submission for purchase errors, but log it
    } else {
      sessionStorage.setItem('purchaseId', purchaseId);
    }

    // Step 5: Log user activity
    try {
      await logUserActivity(
        userId,
        'form_submission_completed',
        `Submitted form with ${owners.length} owners, ${properties.length} properties, and ${assignments.length} assignments`,
        'form_submission',
        submissionId,
        {
          owners_count: owners.length,
          properties_count: properties.length,
          assignments_count: assignments.length,
          has_document_retrieval: hasDocumentRetrievalService,
          submission_method: 'improved_flow'
        }
      );
    } catch (activityError) {
      console.warn(`[ImprovedSubmission] Activity logging failed:`, activityError);
      // Don't fail the submission for activity logging errors
    }

    console.log(`[ImprovedSubmission] Form submission completed successfully:`, submissionId);
    
    // Clear any pending form data flags
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    sessionStorage.removeItem('forceRetrySubmission');
    
    toast.success("Form submitted successfully!", {
      description: "Thank you for completing the property owner intake process."
    });

    return {
      success: true,
      submissionId,
      purchaseId
    };

  } catch (error: any) {
    console.error(`[ImprovedSubmission] Submission ${submissionKey} failed:`, error);

    // Enhanced error handling
    let errorMessage = error instanceof Error ? error.message : 'Unknown submission error';
    
    if (errorMessage.includes('violates row-level security policy')) {
      errorMessage = "Account verification required. Please check your email and verify your account.";
      
      // Set flag for retry after verification
      sessionStorage.setItem('forceRetrySubmission', 'true');
    } else if (errorMessage.includes('duplicate key value')) {
      errorMessage = "This submission already exists. Please refresh the page and try again.";
    } else if (errorMessage.includes('foreign key constraint')) {
      errorMessage = "Data relationship error. Please contact support.";
    }

    toast.error('Submission failed', {
      description: errorMessage
    });

    return { 
      success: false,
      error: errorMessage
    };
  }
};
