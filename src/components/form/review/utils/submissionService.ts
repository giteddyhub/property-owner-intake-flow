
import { toast } from 'sonner';
import type { SubmissionData } from './types';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { supabase } from '@/integrations/supabase/client';

// Reset the globals when the module is loaded to prevent issues with stale state
const activeSubmissions = new Set();
const completedSubmissionsByUser = new Set();

// Define a clear return type interface
export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  purchaseId?: string;
}

export const submitFormData = async (
  owners,
  properties,
  assignments,
  contactInfo,
  userId = null
): Promise<SubmissionResult> => {
  // Generate a unique submission ID
  const submissionKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Check if another submission is already in progress
  if (activeSubmissions.size > 0) {
    console.log("Warning: Another submission is already in progress", 
      { active: Array.from(activeSubmissions), current: submissionKey });
    
    // Instead of blocking, we'll clear the active submissions and proceed
    // This helps recover from stuck submission states
    console.log("Clearing active submissions to allow this submission to proceed");
    activeSubmissions.clear();
  }
  
  // Add this submission to active list
  activeSubmissions.add(submissionKey);
  
  try {
    console.log(`Starting submission ${submissionKey} with:`, {
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length,
      contactInfo,
      userId
    });
    
    // Check if user is authenticated
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        console.log("Found authenticated user:", userId);
      } else {
        console.log("No authenticated user found, this submission will likely fail");
      }
    }
    
    // Store the counts in sessionStorage for pricing calculation on tax filing page
    sessionStorage.setItem('ownersCount', String(owners.length));
    sessionStorage.setItem('propertiesCount', String(properties.length));
    
    // Check if any property has document retrieval service
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    
    // Store this information in sessionStorage for the tax filing page
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // Step 1: Create form submission entry with the user_id
    console.log("Creating form submission with userId:", userId);
    
    const submissionData = {
      user_id: userId,
      submitted_at: new Date().toISOString(),
      state: 'new',
      has_document_retrieval: hasDocumentRetrievalService
    };
    
    // Only attempt to create form submission if user is logged in
    if (!userId) {
      console.log("No user ID available, skipping form submission creation");
      activeSubmissions.delete(submissionKey);
      return { success: false };
    }
    
    // Create the form submission
    const { data: formData, error: formError } = await supabase
      .from('form_submissions')
      .insert(submissionData)
      .select('id')
      .single();
    
    if (formError) {
      console.error('Failed to create form submission:', formError);
      throw formError;
    }
    
    const submissionId = formData.id;
    console.log("Form submission created with ID:", submissionId);
    
    // Store submission ID in sessionStorage
    sessionStorage.setItem('submissionId', submissionId);
    
    // Step 2: Save owners and get ID mappings - ensure user_id is passed
    console.log("Saving owners with userId:", userId);
    const ownerIdMap = await saveOwners(owners, submissionId, userId);
    console.log("Owner ID mapping:", ownerIdMap);
    
    // Step 3: Save properties and get ID mappings - ensure user_id is passed
    console.log("Saving properties with userId:", userId);
    const propertyIdMap = await saveProperties(properties, submissionId, userId);
    console.log("Property ID mapping:", propertyIdMap);
    
    // Step 4: Save owner-property assignments - ensure user_id is passed
    console.log("Saving assignments with userId:", userId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, submissionId, userId);
    console.log("Assignments saved successfully");
    
    // Add user ID to completed submissions set to prevent duplicates
    if (userId) {
      completedSubmissionsByUser.add(userId);
    }
    
    // Create a purchase entry to track this session
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        contact_id: submissionId, // Required field until we fully migrate
        form_submission_id: submissionId, // New field that replaces contact_id
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
    
    console.log("Form data submitted successfully with submission ID:", submissionId);
    
    // Clear pending form data immediately after submission
    sessionStorage.removeItem('pendingFormData');
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    return {
      success: true,
      submissionId,
      purchaseId: purchase.id
    };
    
  } catch (error) {
    console.error(`Submission ${submissionKey} failed:`, error);
    
    // Special handling for RLS policy errors
    if (error.message && error.message.includes('violates row-level security policy')) {
      toast.error("Authorization error: You need to be logged in to submit data");
    } else {
      toast.error(error instanceof Error ? error.message : 'Please try again later');
    }
    
    return { success: false };
  } finally {
    // Remove this submission from active list
    activeSubmissions.delete(submissionKey);
  }
};
