
import { toast } from '@/hooks/use-toast';
import type { SubmissionData } from './types';
import { saveContactInfo } from './contactService';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { supabase } from '@/integrations/supabase/client';

export const submitFormData = async (
  owners,
  properties,
  assignments,
  contactInfo,
  userId = null
) => {
  try {
    console.log("Starting submission process with:", {
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length,
      contactInfo,
      userId
    });
    
    // Check if any property has document retrieval service enabled
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    
    // Store this information in sessionStorage for the success page
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // Step 1: Save contact information
    const contactId = await saveContactInfo(contactInfo, userId);
    
    // Store contact ID in sessionStorage
    sessionStorage.setItem('contactId', contactId);
    
    // Step 2: Save owners and get ID mappings
    const ownerIdMap = await saveOwners(owners, contactId, userId);
    
    // Step 3: Save properties and get ID mappings
    const propertyIdMap = await saveProperties(properties, contactId, userId);
    
    // Step 4: Save owner-property assignments
    await saveAssignments(assignments, propertyIdMap, ownerIdMap, contactId);
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    // Add a brief delay before redirecting to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to the success page
    window.location.href = '/success';
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    throw error;
  }
};
