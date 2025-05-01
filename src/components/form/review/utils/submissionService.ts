
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
    
    // Enhanced userId resolution with multiple fallbacks
    let effectiveUserId = userId;
    
    // If no userId is provided but we have a pendingUserId in storage, use it
    if (!effectiveUserId) {
      const pendingUserId = sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
      if (pendingUserId) {
        console.log("Using pending user ID from storage:", pendingUserId);
        effectiveUserId = pendingUserId;
      }
    }
    
    // Double check if we can get the current user from Supabase
    if (!effectiveUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        effectiveUserId = sessionData.session.user.id;
        console.log("Retrieved user ID from current session:", effectiveUserId);
      }
    }
    
    // If email is provided, try to find user by email as last resort
    if (!effectiveUserId && contactInfo?.email) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contactInfo.email)
        .maybeSingle();
        
      if (!error && data?.id) {
        effectiveUserId = data.id;
        console.log("Found user ID by email lookup:", effectiveUserId);
        
        // Store it for future use
        sessionStorage.setItem('pendingUserId', effectiveUserId);
        localStorage.setItem('pendingUserId', effectiveUserId);
      }
    }
    
    // Create an extra safety measure - if we have a userId, store email association in sessionStorage
    // This can help with recovery later if needed
    if (effectiveUserId && contactInfo?.email) {
      sessionStorage.setItem('userEmail', contactInfo.email);
      localStorage.setItem('userEmail', contactInfo.email);
    }
    
    // Log final authentication status
    console.log("Final user ID for submission:", effectiveUserId);
    
    if (!effectiveUserId) {
      console.error("No user ID available for submission");
      toast.error("Authentication required. Please sign in to continue.");
      throw new Error("No user ID available for submission");
    }
    
    // Check if any property has document retrieval service enabled
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    
    // Store this information in sessionStorage for the tax filing page
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // Step 1: Save contact information with userId explicitly
    console.log("Saving contact info with userId:", effectiveUserId);
    const contactId = await saveContactInfo(contactInfo, effectiveUserId);
    
    // Store contact ID in sessionStorage
    console.log("Contact saved with ID:", contactId);
    sessionStorage.setItem('contactId', contactId);
    localStorage.setItem('contactId', contactId);
    
    // Add a small delay to ensure contact is saved completely
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 2: Save owners with userId explicitly
    console.log("Saving owners with userId:", effectiveUserId);
    const ownerIdMap = await saveOwners(owners, contactId, effectiveUserId);
    console.log("Owners saved:", Array.from(ownerIdMap.entries()));
    
    // Step 3: Save properties with userId explicitly
    console.log("Saving properties with userId:", effectiveUserId);
    const propertyIdMap = await saveProperties(properties, contactId, effectiveUserId);
    console.log("Properties saved:", Array.from(propertyIdMap.entries()));
    
    // Step 4: Save owner-property assignments with userId explicitly
    console.log("Saving assignments with userId:", effectiveUserId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, contactId, effectiveUserId);
    console.log("All assignments saved successfully");
    
    // Add a delay to ensure all data is fully saved
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify data was saved correctly by checking counts
    const { data: savedOwners, error: ownersError } = await supabase
      .from('owners')
      .select('id')
      .eq('user_id', effectiveUserId);
      
    const { data: savedProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', effectiveUserId);
      
    const { data: savedAssignments, error: assignmentsError } = await supabase
      .from('owner_property_assignments')
      .select('id')
      .eq('user_id', effectiveUserId);
      
    console.log("Data verification:", {
      savedOwners: savedOwners?.length || 0,
      savedProperties: savedProperties?.length || 0,
      savedAssignments: savedAssignments?.length || 0,
      errors: {
        ownersError,
        propertiesError,
        assignmentsError
      }
    });
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
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
    console.log("Purchase created with ID:", purchase.id);
    
    // Final verification check - ensure we can see the data
    const { error: finalCheck } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', effectiveUserId)
      .maybeSingle();
      
    if (finalCheck) {
      console.warn("Final verification check failed:", finalCheck);
      // Try one more time to update the user_id
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ user_id: effectiveUserId })
        .eq('id', contactId);
        
      if (updateError) {
        console.error("Final attempt to update contact failed:", updateError);
      } else {
        console.log("Final contact update succeeded");
      }
    } else {
      console.log("Final verification passed - data is correctly associated");
    }
    
    // Redirect to the tax filing service page
    window.location.href = `/tax-filing-service/${purchase.id}`;
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    throw error;
  }
};
