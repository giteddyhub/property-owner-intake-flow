
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContactInfo, SubmissionResult } from './types';
import { submitFormData as submitData } from './submissionService';

// Create a simple submission tracker using sessionStorage
const getSubmissionState = () => {
  try {
    const key = 'submitted_users';
    const state = sessionStorage.getItem(key);
    return state ? JSON.parse(state) : { users: {} };
  } catch (e) {
    return { users: {} };
  }
};

const markUserSubmitted = (userId: string) => {
  try {
    const key = 'submitted_users';
    const state = getSubmissionState();
    state.users[userId] = Date.now();
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error("[submitUtils] Error marking user as submitted:", e);
  }
};

const isUserAlreadySubmitted = (userId: string) => {
  try {
    const state = getSubmissionState();
    return !!state.users[userId];
  } catch (e) {
    return false;
  }
};

/**
 * Wrapper for submitting form data with additional validation
 */
export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo,
  userId: string | null = null
): Promise<SubmissionResult> => {
  try {
    console.log("[submitUtils] Starting submission process with:", { 
      userId,
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length
    });
    
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
    
    if (!userId) {
      console.log("[submitUtils] No userId provided, checking for authenticated user");
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
        console.log("[submitUtils] Found authenticated user:", userId);
      } else {
        console.error("[submitUtils] No user ID available and no authenticated user found");
        return { 
          success: false, 
          error: "Authentication required for submission. Please sign in to continue." 
        };
      }
    }
    
    // Check if this user has already submitted data in this session
    if (userId && isUserAlreadySubmitted(userId)) {
      console.log("[submitUtils] User has already submitted data in this session:", userId);
      return {
        success: true,
        error: "Your information has already been submitted."
      };
    }
    
    // Check if we've already submitted this data to prevent duplicates
    const lastSubmissionTime = sessionStorage.getItem('lastSubmissionTime');
    const currentTime = Date.now();
    
    // If we have a submission timestamp and it's less than 5 seconds ago, prevent duplicate submission
    if (lastSubmissionTime && (currentTime - parseInt(lastSubmissionTime)) < 5000) {
      console.log("[submitUtils] Preventing duplicate submission - too soon after last submission");
      return {
        success: false,
        error: "Please wait a moment before submitting again."
      };
    }
    
    // Set submission timestamp to prevent duplicates
    sessionStorage.setItem('lastSubmissionTime', currentTime.toString());
    
    // Use the main submission service for the actual submission
    const result = await submitData(owners, properties, assignments, contactInfo, userId, true);
    
    // If submission was successful, mark this user as having submitted data
    if (result.success && userId) {
      markUserSubmitted(userId);
    }
    
    return result;
  } catch (error: any) {
    console.error('[submitUtils] Error submitting form data:', error);
    toast.error('Failed to submit your information. Please try again.');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
