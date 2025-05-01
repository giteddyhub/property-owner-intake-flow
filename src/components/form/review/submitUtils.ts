
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
    
    console.log("Starting submission process with userId:", userId);
    
    // Import and use the comprehensive submission service directly
    return import('./utils/submissionService').then(module => {
      return module.submitFormData(owners, properties, assignments, contactInfo, userId);
    });
  } catch (error) {
    console.error('Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    throw error;
  }
};
