
import { toast } from 'sonner';
import type { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import type { ContactInfo } from './types';
import { submissionTracker } from './submissionTracker';
import { validateSubmission } from './submissionValidator';
import { createFormSubmission, createPurchaseEntry, saveFormData } from './databaseService';

// Define a clear return type interface
export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  purchaseId?: string;
  error?: string;
}

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo,
  userId: string,
  isImmediateSubmission: boolean = false
): Promise<SubmissionResult> => {
  // Generate a unique submission key
  const submissionKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[submissionService] Starting submission ${submissionKey} with userId:`, userId);
  console.log(`[submissionService] isImmediateSubmission:`, isImmediateSubmission);
  
  // Reset tracker if needed (after page reload)
  if (window.location.pathname === '/' && sessionStorage.getItem('pendingFormData')) {
    console.log("[submissionService] On index page with pending form data, resetting submission tracker");
    submissionTracker.reset();
  }
  
  // Verify userId is provided
  if (!userId) {
    const error = "User ID is required for form submission";
    console.error(`[submissionService] ${error}`);
    return { success: false, error };
  }
  
  // Validate the submission
  const validationResult = await validateSubmission(userId, submissionKey, isImmediateSubmission);
  
  if (!validationResult.valid) {
    return { 
      success: false, 
      error: validationResult.error 
    };
  }
  
  // If validation returned an existing submission ID, return it
  if (validationResult.submissionId) {
    return {
      success: true,
      submissionId: validationResult.submissionId,
      error: validationResult.error
    };
  }
  
  // Add this submission to active list
  submissionTracker.addActive(submissionKey);
  
  try {
    // Store counts for pricing calculation on tax filing page
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
    
    // Store submission ID in sessionStorage
    sessionStorage.setItem('submissionId', submissionId);
    
    // Step 2-4: Save form data (owners, properties, assignments)
    const { success, error: saveError } = await saveFormData(owners, properties, assignments, submissionId, userId);
    
    if (!success || saveError) {
      throw saveError || new Error("Failed to save form data");
    }
    
    // Create a purchase entry to track this session
    const { purchaseId, error: purchaseError } = await createPurchaseEntry(submissionId, hasDocumentRetrievalService);
    
    if (purchaseError) {
      throw purchaseError;
    }
    
    // Store purchase ID in sessionStorage
    sessionStorage.setItem('purchaseId', purchaseId);
    
    console.log("[submissionService] Form data submitted successfully with submission ID:", submissionId);
    
    // Clear pending form data immediately after submission
    sessionStorage.removeItem('pendingFormData');
    sessionStorage.removeItem('submitAfterVerification');
    
    // Mark user as having completed a submission
    submissionTracker.addCompleted(userId);
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    return {
      success: true,
      submissionId,
      purchaseId
    };
    
  } catch (error: any) {
    console.error(`[submissionService] Submission ${submissionKey} failed:`, error);
    
    // Handle errors in a more user-friendly way
    if (error.message && error.message.includes('violates row-level security policy')) {
      console.warn("[submissionService] RLS policy violation detected");
      sessionStorage.setItem('forceRetrySubmission', 'true');
      toast.warning("Your account has been created. We'll complete your submission shortly.");
      
      return { 
        success: false, 
        error: "Your account has been created. We'll complete your submission once your account is fully set up."
      };
    }
    
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown submission error'
    };
  } finally {
    // Remove this submission from active list
    submissionTracker.removeActive(submissionKey);
  }
};
