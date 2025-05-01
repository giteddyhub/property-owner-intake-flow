
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { toast } from 'sonner';
import { submitFormData as submitToDatabase } from './submissionService';
import { supabase } from '@/integrations/supabase/client';

// Change from `export` to `export type` for type re-exports
export type { ContactInfo } from './types';

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: any,
  userId: string | null = null
): Promise<void> => {
  try {
    console.log("Starting submission with user ID:", userId);
    
    // Double-check current auth state
    const { data: session } = await supabase.auth.getSession();
    const currentUserId = session?.session?.user?.id;
    
    if (currentUserId && (!userId || userId !== currentUserId)) {
      console.log("Found authenticated user ID that differs from provided userId. Using authenticated ID.");
      userId = currentUserId;
    }
    
    // If still no userId, try to get from storage as last resort
    if (!userId) {
      userId = sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
      console.log("Using userId from storage:", userId);
    }
    
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
    
    console.log("Submitting to database with userId:", userId);
    
    // This function now delegates to the main submission service
    // which will handle redirecting to the appropriate page
    // Pass the userId parameter to ensure data is associated with the user
    return submitToDatabase(owners, properties, assignments, contactInfo, userId);
  } catch (error) {
    console.error('Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    throw error;
  }
};
