
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { ContactInfo } from './types';
import { saveContactInfo } from './contactService';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo,
  userId: string | null = null
): Promise<void> => {
  try {
    // Check for stored pending user ID (for users who just verified their email)
    const pendingUserId = sessionStorage.getItem('pendingUserId');
    const effectiveUserId = userId || pendingUserId || null;
    
    // Save contact information first
    const contactId = await saveContactInfo(contactInfo, effectiveUserId);
    console.log("Contact saved with ID:", contactId);
    
    // Save owners and get mapping of client IDs to database IDs
    const ownerIdMap = await saveOwners(owners, contactId, effectiveUserId);
    console.log("Owners saved, ID mapping:", ownerIdMap);
    
    // Save properties and get mapping of client IDs to database IDs
    const propertyIdMap = await saveProperties(properties, contactId, effectiveUserId);
    console.log("Properties saved, ID mapping:", propertyIdMap);
    
    // Save owner-property assignments
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, contactId, effectiveUserId);
    console.log("Assignments saved successfully");
    
    // Store contact ID in session storage for the success page
    sessionStorage.setItem('contactId', contactId);
    
    // Clear the pending user ID after successful submission
    if (pendingUserId) {
      sessionStorage.removeItem('pendingUserId');
    }
    
    // Redirect to success page
    window.location.href = '/success';
  } catch (error) {
    console.error("Error during form submission:", error);
    throw error;
  }
};
