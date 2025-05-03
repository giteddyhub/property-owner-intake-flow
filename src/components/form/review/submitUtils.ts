
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Change from `export` to `export type` for type re-exports
export type { ContactInfo } from './utils/types';

// Update the return type to match what's actually returned from the function
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
  contactInfo: any,
  userId: string | null = null
): Promise<SubmissionResult> => {
  try {
    console.log("[submitUtils] Starting submission process with:", { 
      userId,
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length
    });
    
    // Store the counts in sessionStorage for pricing calculation on tax filing page
    sessionStorage.setItem('ownersCount', String(owners.length));
    sessionStorage.setItem('propertiesCount', String(properties.length));
    
    // Check if any property has document retrieval service
    const hasDocumentRetrievalService = properties.some(
      property => property.useDocumentRetrievalService
    );
    
    // Store in session storage for the tax filing page
    sessionStorage.setItem('hasDocumentRetrievalService', 
      JSON.stringify(hasDocumentRetrievalService)
    );
    
    // Critical check: We absolutely need a user ID for RLS policies
    if (!userId) {
      console.log("[submitUtils] No userId provided, checking for authenticated user");
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
        console.log("[submitUtils] Found authenticated user:", userId);
      } else {
        console.error("[submitUtils] No user ID available and no authenticated user found");
        return { 
          success: false, 
          error: "Authentication required for submission. Please sign in to continue." 
        };
      }
    }
    
    // Set isImmediateSubmission flag to true to skip email verification check
    // This will ensure that the submission happens even if email is not verified
    return import('./utils/submissionService').then(module => {
      // Pass flag to indicate this is an immediate submission and should bypass email verification
      return module.submitFormData(owners, properties, assignments, contactInfo, userId, true);
    });
  } catch (error: any) {
    console.error('[submitUtils] Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
