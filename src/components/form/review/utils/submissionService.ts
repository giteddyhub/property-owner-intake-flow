
import { toast } from 'sonner';
import type { ContactInfo } from './types';
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
    
    // If no userId is provided but we have a pendingUserId in sessionStorage, use it
    if (!userId) {
      const pendingUserId = sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
      if (pendingUserId) {
        console.log("Using pending user ID from storage:", pendingUserId);
        userId = pendingUserId;
      }
    }
    
    // Double check if we can get the current user from Supabase
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        userId = sessionData.session.user.id;
        console.log("Retrieved user ID from current session:", userId);
      }
    }
    
    // Log authentication status
    console.log("Final user ID for submission:", userId);
    
    if (!userId) {
      console.error("No user ID available for submission");
      toast.error("Authentication required. Please sign in to continue.");
      throw new Error("No user ID available for submission");
    }
    
    // Check if any property has document retrieval service enabled
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    
    // Store this information in sessionStorage for the tax filing page
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // Step 1: Save contact information with userId explicitly
    const contactId = await saveContactInfo(contactInfo, userId);
    
    // Store contact ID in sessionStorage
    sessionStorage.setItem('contactId', contactId);
    
    // Step 2: Save owners with userId explicitly
    const ownerIdMap = await saveOwners(owners, contactId, userId);
    
    // Step 3: Save properties with userId explicitly
    const propertyIdMap = await saveProperties(properties, contactId, userId);
    
    // Step 4: Save owner-property assignments with userId explicitly
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, contactId, userId);
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    // Add a brief delay before redirecting to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a purchase entry to track this tax filing session
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        contact_id: contactId,
        payment_status: 'pending',
        has_document_retrieval: hasDocumentRetrievalService,
        amount: 0 // Will be calculated during checkout
      })
      .select('id')
      .single();
      
    if (purchaseError) {
      console.error('Failed to create purchase:', purchaseError);
      throw purchaseError;
    }
    
    // Store purchase ID in sessionStorage
    sessionStorage.setItem('purchaseId', purchase.id);
    
    // Redirect to the tax filing service page
    window.location.href = `/tax-filing-service/${purchase.id}`;
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    throw error;
  }
};
