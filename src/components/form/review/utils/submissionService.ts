
import { toast } from 'sonner';
import type { SubmissionData } from './types';
import { saveContactInfo } from './contactService';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { supabase } from '@/integrations/supabase/client';

// Keep track of submissions in progress to prevent duplicates
const activeSubmissions = new Set();

// Keep track of completed submissions by user ID to prevent duplicates
const completedSubmissionsByUser = new Set();

export const submitFormData = async (
  owners,
  properties,
  assignments,
  contactInfo,
  userId = null
) => {
  // Generate a unique submission ID
  const submissionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Check if we already have a submission in progress
  if (activeSubmissions.size > 0) {
    console.log("Warning: Another submission is already in progress", 
      { active: Array.from(activeSubmissions), current: submissionId });
    toast.warning("Please wait, submission already in progress");
    return false;
  }

  // If the user is logged in, check if they already have a completed submission
  if (userId && completedSubmissionsByUser.has(userId)) {
    console.log(`User ${userId} already has a completed submission. Preventing duplicate.`);
    toast.info("Your information has already been submitted");
    return false;
  }
  
  // Add this submission to active list
  activeSubmissions.add(submissionId);
  
  try {
    console.log(`Starting submission ${submissionId} with:`, {
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

        // Check again if this user already has a submission
        if (completedSubmissionsByUser.has(userId)) {
          console.log(`User ${userId} already has a completed submission. Preventing duplicate.`);
          toast.info("Your information has already been submitted");
          return false;
        }
      } else {
        console.log("No authenticated user found");
      }
    }
    
    // Check if any property has document retrieval service enabled
    const hasDocumentRetrievalService = properties.some(property => property.useDocumentRetrievalService);
    
    // Store this information in sessionStorage for the tax filing page
    sessionStorage.setItem('hasDocumentRetrievalService', JSON.stringify(hasDocumentRetrievalService));
    
    // Step 1: Create form submission entry (previously saving contact info)
    console.log("Creating form submission with userId:", userId);
    const submissionId = await saveContactInfo(contactInfo, userId);
    console.log("Form submission created with ID:", submissionId);
    
    // Store submission ID in sessionStorage (previously contactId)
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
    
    // If this is an immediate submission during signup (before email verification),
    // don't redirect or show completion message yet
    const isImmediateSubmissionAfterSignup = !document.cookie.includes('supabase-auth-token');
    if (isImmediateSubmissionAfterSignup) {
      console.log("Immediate submission after signup completed - data will be available after email verification");
      return true;
    }
    
    // Success notification for regular submissions
    toast.success("Form submitted successfully! Thank you for completing the property owner intake process.");
    
    // Add a brief delay before redirecting to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // If the user is authenticated, create a tax filing session and redirect to it
    if (userId) {
      // Create a purchase entry to track this session
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          form_submission_id: submissionId, // Updated from contact_id
          payment_status: 'pending',
          has_document_retrieval: hasDocumentRetrievalService,
          amount: 0, // Will be calculated during checkout
          user_id: userId
        })
        .select('id')
        .single();
        
      if (purchaseError) {
        console.error('Failed to create purchase:', purchaseError);
        throw purchaseError;
      }
      
      // Store purchase ID in sessionStorage
      sessionStorage.setItem('purchaseId', purchase.id);
      
      console.log("Redirecting to tax filing service page with purchase ID:", purchase.id);
      
      // Clear pending form data immediately after submission
      sessionStorage.removeItem('pendingFormData');
      
      // For regular submissions (not immediately after signup), redirect to the tax filing service page
      window.location.href = `/tax-filing-service/${purchase.id}`;
      
      return true;
    } else {
      // If user is not logged in, redirect to success page as fallback
      // This path should rarely happen as users are prompted to log in before submission
      console.log("No user ID available, redirecting to success page");
      window.location.href = '/success';
      
      return false;
    }
    
  } catch (error) {
    console.error(`Submission ${submissionId} failed:`, error);
    toast.error(error instanceof Error ? error.message : 'Please try again later');
    throw error;
  } finally {
    // Remove this submission from active list
    activeSubmissions.delete(submissionId);
  }
};
