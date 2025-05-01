
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Change from `export` to `export type` for type re-exports
export type { ContactInfo } from './utils/types';

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: any,
  userId: string | null = null
): Promise<void> => {
  try {
    console.log("Starting submission with user ID:", userId);
    
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
    
    // This function now delegates to the main submission service
    // which will handle redirecting to the appropriate page
    // Pass the userId parameter to ensure data is associated with the user
    return import('./utils/submissionService').then(module => {
      return module.submitFormData(owners, properties, assignments, contactInfo, userId);
    });
  } catch (error) {
    console.error('Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    throw error;
  }
};
