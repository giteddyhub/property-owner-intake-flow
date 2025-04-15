
import { toast } from 'sonner';
import { SubmissionData } from './types';
import { saveContactInfo } from './contactService';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';

export const submitFormData = async (
  owners,
  properties,
  assignments,
  contactInfo
) => {
  try {
    console.log("Starting submission process with:", {
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length,
      contactInfo
    });
    
    // Step 1: Save contact information
    const contactId = await saveContactInfo(contactInfo);
    
    // Step 2: Save owners and get ID mappings
    const ownerIdMap = await saveOwners(owners, contactId);
    
    // Step 3: Save properties and get ID mappings
    const propertyIdMap = await saveProperties(properties, contactId);
    
    // Step 4: Save owner-property assignments
    await saveAssignments(assignments, propertyIdMap, ownerIdMap, contactId);
    
    // Success notification and redirect
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    // Redirect to the success page
    window.location.href = '/success';
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    throw error;
  }
};
