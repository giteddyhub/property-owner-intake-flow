
import { toast } from 'sonner';
import type { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import type { ContactInfo } from './types';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { supabase } from '@/integrations/supabase/client';

// Define a clear return type interface
export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  purchaseId?: string;
  error?: string;
}

// Create a submission tracking system that works across module reloads
const getSubmissionTracker = (() => {
  const STATE_KEY = 'form_submission_state';
  
  const getState = () => {
    try {
      const state = sessionStorage.getItem(STATE_KEY);
      return state ? JSON.parse(state) : { active: [], completed: [] };
    } catch (e) {
      return { active: [], completed: [] };
    }
  };
  
  const setState = (state) => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  };
  
  return {
    isActive: (key) => {
      const state = getState();
      return state.active.includes(key);
    },
    
    isCompleted: (userId) => {
      const state = getState();
      return state.completed.includes(userId);
    },
    
    addActive: (key) => {
      const state = getState();
      if (!state.active.includes(key)) {
        state.active.push(key);
        setState(state);
      }
    },
    
    removeActive: (key) => {
      const state = getState();
      state.active = state.active.filter(k => k !== key);
      setState(state);
    },
    
    addCompleted: (userId) => {
      const state = getState();
      if (!state.completed.includes(userId)) {
        state.completed.push(userId);
        setState(state);
      }
    },
    
    reset: () => {
      setState({ active: [], completed: [] });
    }
  };
})();

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo,
  userId: string
): Promise<SubmissionResult> => {
  // Generate a unique submission key
  const submissionKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[submissionService] Starting submission ${submissionKey} with userId:`, userId);
  
  // Reset tracker if needed (after page reload)
  if (window.location.pathname === '/' && sessionStorage.getItem('pendingFormData')) {
    console.log("[submissionService] On index page with pending form data, resetting submission tracker");
    getSubmissionTracker.reset();
  }
  
  // Check if this user already has a completed submission
  if (userId && getSubmissionTracker.isCompleted(userId)) {
    console.log(`[submissionService] User ${userId} already has a completed submission`);
    toast.info("Your information has already been submitted successfully");
    return { success: true };
  }
  
  // Check if another submission is already in progress
  if (getSubmissionTracker.isActive(submissionKey)) {
    console.log(`[submissionService] Submission ${submissionKey} already in progress`);
    return { 
      success: false, 
      error: "Another submission is already in progress" 
    };
  }
  
  // Add this submission to active list
  getSubmissionTracker.addActive(submissionKey);
  
  try {
    // Log submission details for debugging
    console.log(`[submissionService] Processing submission ${submissionKey}:`, {
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length,
      userId
    });
    
    // Store counts for pricing calculation on tax filing page
    sessionStorage.setItem('ownersCount', String(owners.length));
    sessionStorage.setItem('propertiesCount', String(properties.length));
    
    // Check if any property has document retrieval service
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // CRITICAL: Verify the user is authenticated
    if (!userId) {
      throw new Error("User ID is required for form submission");
    }
    
    // Step 1: Create form submission entry
    console.log(`[submissionService] Creating form submission for user:`, userId);
    
    const submissionData = {
      user_id: userId,
      submitted_at: new Date().toISOString(),
      state: 'new',
      has_document_retrieval: hasDocumentRetrievalService
    };
    
    const { data: formData, error: formError } = await supabase
      .from('form_submissions')
      .insert(submissionData)
      .select('id')
      .single();
    
    if (formError) {
      console.error('[submissionService] Failed to create form submission:', formError);
      throw new Error(`Database error: ${formError.message}`);
    }
    
    const submissionId = formData.id;
    console.log("[submissionService] Form submission created with ID:", submissionId);
    
    // Store submission ID in sessionStorage
    sessionStorage.setItem('submissionId', submissionId);
    
    // Step 2: Save owners and get ID mappings
    console.log("[submissionService] Saving owners with userId:", userId);
    const ownerIdMap = await saveOwners(owners, submissionId, userId);
    console.log("[submissionService] Owner ID mapping:", ownerIdMap);
    
    // Step 3: Save properties and get ID mappings
    console.log("[submissionService] Saving properties with userId:", userId);
    const propertyIdMap = await saveProperties(properties, submissionId, userId);
    console.log("[submissionService] Property ID mapping:", propertyIdMap);
    
    // Step 4: Save owner-property assignments
    console.log("[submissionService] Saving assignments with userId:", userId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, submissionId, userId);
    console.log("[submissionService] Assignments saved successfully");
    
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
      console.error('[submissionService] Failed to create purchase:', purchaseError);
      throw new Error(`Purchase creation error: ${purchaseError.message}`);
    }
    
    // Store purchase ID in sessionStorage
    sessionStorage.setItem('purchaseId', purchase.id);
    
    console.log("[submissionService] Form data submitted successfully with submission ID:", submissionId);
    
    // Clear pending form data immediately after submission
    sessionStorage.removeItem('pendingFormData');
    
    // Mark user as having completed a submission
    getSubmissionTracker.addCompleted(userId);
    
    // Success notification
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    return {
      success: true,
      submissionId,
      purchaseId: purchase.id
    };
    
  } catch (error: any) {
    console.error(`[submissionService] Submission ${submissionKey} failed:`, error);
    
    // Special handling for RLS policy errors
    if (error.message && error.message.includes('violates row-level security policy')) {
      toast.error("Authorization error: You need to be logged in to submit data");
      return { 
        success: false, 
        error: "Authorization error: You need to be logged in to submit data"
      };
    }
    
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown submission error'
    };
  } finally {
    // Remove this submission from active list
    getSubmissionTracker.removeActive(submissionKey);
  }
};
