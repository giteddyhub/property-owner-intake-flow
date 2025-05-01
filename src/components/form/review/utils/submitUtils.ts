
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: any,
  userId: string | null
) => {
  try {
    // Store the counts in sessionStorage for pricing calculation on success page
    sessionStorage.setItem('ownersCount', String(owners.length));
    sessionStorage.setItem('propertiesCount', String(properties.length));
    
    // Check if any property has document retrieval service
    const hasDocumentRetrievalService = properties.some(
      property => property.useDocumentRetrievalService
    );
    
    // Store in session storage for the success page
    sessionStorage.setItem('hasDocumentRetrievalService', 
      JSON.stringify(hasDocumentRetrievalService)
    );
    
    // After successful submission, redirect to success page
    window.location.href = '/success';
    
  } catch (error) {
    console.error('Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    throw error;
  }
};
