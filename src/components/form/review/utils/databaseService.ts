
import { supabase } from '@/integrations/supabase/client';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { submissionTracker } from './submissionTracker';
import { toast } from 'sonner';
import { SubmissionResult } from './types';

/**
 * Creates a form submission entry in the database
 */
export const createFormSubmission = async (
  userId: string, 
  hasDocumentRetrievalService: boolean
): Promise<{ submissionId: string, error?: Error }> => {
  console.log(`[databaseService] Creating form submission for user:`, userId);
  
  const submissionData = {
    user_id: userId,
    submitted_at: new Date().toISOString(),
    state: 'new',
    has_document_retrieval: hasDocumentRetrievalService
  };
  
  try {
    const response = await supabase
      .from('form_submissions')
      .insert(submissionData)
      .select('id')
      .single();
    
    if (response.error) {
      console.error('[databaseService] Failed to create form submission:', response.error);
      
      if (response.error.message?.includes('violates row-level security policy')) {
        console.warn("[databaseService] RLS policy violation detected");
        sessionStorage.setItem('forceRetrySubmission', 'true');
        throw new Error("We encountered a database permission error. Your data has been saved and will be submitted once you verify your email.");
      }
      
      throw new Error(`Database error: ${response.error.message}`);
    }
    
    const submissionId = response.data.id;
    console.log("[databaseService] Form submission created with ID:", submissionId);
    
    // Store submission ID in our tracker to prevent duplicates
    submissionTracker.storeSubmissionId(userId, submissionId);
    
    // Log activity for form submission creation
    try {
      await supabase.rpc('log_user_activity', {
        user_id: userId,
        activity_type: 'submission_created',
        activity_description: 'User completed initial form submission',
        entity_type: 'form_submission',
        entity_id: submissionId,
        metadata: {
          has_document_retrieval: hasDocumentRetrievalService,
          submission_state: 'new'
        }
      });
    } catch (activityError) {
      console.warn('[databaseService] Failed to log activity:', activityError);
      // Don't fail the submission for activity logging errors
    }
    
    return { submissionId };
  } catch (error) {
    return { 
      submissionId: '', 
      error: error instanceof Error ? error : new Error('Unknown error creating form submission') 
    };
  }
};

/**
 * Creates a purchase entry in the database
 */
export const createPurchaseEntry = async (
  submissionId: string,
  hasDocumentRetrievalService: boolean
): Promise<{ purchaseId: string, error?: Error }> => {
  try {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        contact_id: submissionId,
        form_submission_id: submissionId,
        payment_status: 'pending',
        has_document_retrieval: hasDocumentRetrievalService,
        amount: 0
      })
      .select('id')
      .single();
    
    if (purchaseError) {
      console.error('[databaseService] Failed to create purchase:', purchaseError);
      throw new Error(`Purchase creation error: ${purchaseError.message}`);
    }
    
    return { purchaseId: purchase.id };
  } catch (error) {
    return { 
      purchaseId: '', 
      error: error instanceof Error ? error : new Error('Unknown error creating purchase') 
    };
  }
};

/**
 * Saves all form data to the database
 */
export const saveFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  submissionId: string,
  userId: string
): Promise<{ success: boolean, error?: Error }> => {
  try {
    // Save owners and get ID mappings
    console.log("[databaseService] Saving owners with userId:", userId);
    const ownerIdMap = await saveOwners(owners, submissionId, userId);
    console.log("[databaseService] Owner ID mapping:", ownerIdMap);
    
    // Log activity for owners creation
    if (owners.length > 0) {
      try {
        await supabase.rpc('log_user_activity', {
          user_id: userId,
          activity_type: 'owner_added',
          activity_description: `Added ${owners.length} property owner(s)`,
          entity_type: 'owner',
          metadata: {
            owner_count: owners.length,
            submission_id: submissionId
          }
        });
      } catch (activityError) {
        console.warn('[databaseService] Failed to log owner activity:', activityError);
      }
    }
    
    // Save properties and get ID mappings
    console.log("[databaseService] Saving properties with userId:", userId);
    const propertyIdMap = await saveProperties(properties, submissionId, userId);
    console.log("[databaseService] Property ID mapping:", propertyIdMap);
    
    // Log activity for properties creation
    if (properties.length > 0) {
      try {
        await supabase.rpc('log_user_activity', {
          user_id: userId,
          activity_type: 'property_added',
          activity_description: `Added ${properties.length} property/properties`,
          entity_type: 'property',
          metadata: {
            property_count: properties.length,
            submission_id: submissionId
          }
        });
      } catch (activityError) {
        console.warn('[databaseService] Failed to log property activity:', activityError);
      }
    }
    
    // Save owner-property assignments
    console.log("[databaseService] Saving assignments with userId:", userId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, submissionId, userId);
    console.log("[databaseService] Assignments saved successfully");
    
    // Log activity for assignments creation
    if (assignments.length > 0) {
      try {
        await supabase.rpc('log_user_activity', {
          user_id: userId,
          activity_type: 'assignment_created',
          activity_description: `Created ${assignments.length} owner-property assignment(s)`,
          entity_type: 'assignment',
          metadata: {
            assignment_count: assignments.length,
            submission_id: submissionId
          }
        });
      } catch (activityError) {
        console.warn('[databaseService] Failed to log assignment activity:', activityError);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("[databaseService] Error saving form data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error saving form data')
    };
  }
};
