
import { supabase } from '@/integrations/supabase/client';
import { submissionTracker } from './submissionTracker';
import { logUserActivity } from './activityLoggingService';

/**
 * Creates a form submission entry in the database
 */
export const createFormSubmission = async (
  userId: string, 
  hasDocumentRetrievalService: boolean
): Promise<{ submissionId: string, error?: Error }> => {
  console.log(`[submissionCreationService] Creating form submission for user:`, userId);
  
  const submissionData = {
    user_id: userId,
    submitted_at: new Date().toISOString(),
    state: 'new',
    has_document_retrieval: hasDocumentRetrievalService
  };
  
  try {
    const response = await supabase
      .from('form_submissions')
      .insert(submissionData)
      .select('id')
      .single();
    
    if (response.error) {
      console.error('[submissionCreationService] Failed to create form submission:', response.error);
      
      if (response.error.message?.includes('violates row-level security policy')) {
        console.warn("[submissionCreationService] RLS policy violation detected");
        sessionStorage.setItem('forceRetrySubmission', 'true');
        throw new Error("We encountered a database permission error. Your data has been saved and will be submitted once you verify your email.");
      }
      
      throw new Error(`Database error: ${response.error.message}`);
    }
    
    const submissionId = response.data.id;
    console.log("[submissionCreationService] Form submission created with ID:", submissionId);
    
    // Store submission ID in our tracker to prevent duplicates
    submissionTracker.storeSubmissionId(userId, submissionId);
    
    // Enhanced activity logging for form submission creation
    await logUserActivity(
      userId,
      'submission_created',
      'User completed initial form submission',
      'form_submission',
      submissionId,
      {
        has_document_retrieval: hasDocumentRetrievalService,
        submission_state: 'new',
        timestamp: new Date().toISOString()
      }
    );
    
    return { submissionId };
  } catch (error) {
    return { 
      submissionId: '', 
      error: error instanceof Error ? error : new Error('Unknown error creating form submission') 
    };
  }
};

/**
 * Creates a purchase entry in the database
 */
export const createPurchaseEntry = async (
  submissionId: string,
  hasDocumentRetrievalService: boolean
): Promise<{ purchaseId: string, error?: Error }> => {
  try {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        form_submission_id: submissionId,
        payment_status: 'pending',
        has_document_retrieval: hasDocumentRetrievalService,
        amount: 0
      })
      .select('id')
      .single();
    
    if (purchaseError) {
      console.error('[submissionCreationService] Failed to create purchase:', purchaseError);
      throw new Error(`Purchase creation error: ${purchaseError.message}`);
    }
    
    return { purchaseId: purchase.id };
  } catch (error) {
    return { 
      purchaseId: '', 
      error: error instanceof Error ? error : new Error('Unknown error creating purchase') 
    };
  }
};
