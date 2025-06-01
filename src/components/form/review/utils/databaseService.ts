
import { supabase } from '@/integrations/supabase/client';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { submissionTracker } from './submissionTracker';
import { toast } from 'sonner';
import { ActivityLogger } from '@/services/activityLogger';

/**
 * Enhanced activity logging function with better error handling
 */
const logUserActivity = async (
  userId: string,
  activityType: string,
  activityDescription: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) => {
  try {
    console.log(`[databaseService] Logging activity for user ${userId}:`, {
      activityType,
      activityDescription,
      entityType,
      entityId,
      metadata
    });

    const { data, error } = await supabase.rpc('log_user_activity', {
      user_id: userId,
      activity_type: activityType,
      activity_description: activityDescription,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata || {}
    });

    if (error) {
      console.error('[databaseService] Failed to log user activity:', error);
      // Try direct insert as fallback
      const { error: insertError } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_description: activityDescription,
          entity_type: entityType || null,
          entity_id: entityId || null,
          metadata: metadata || {}
        });
      
      if (insertError) {
        console.error('[databaseService] Direct insert also failed:', insertError);
      } else {
        console.log('[databaseService] Activity logged via direct insert');
      }
    } else {
      console.log('[databaseService] Activity logged successfully via RPC:', data);
    }
  } catch (error) {
    console.error('[databaseService] Exception during activity logging:', error);
  }
};

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
    
    // Enhanced activity logging for form submission creation
    await logUserActivity(
      userId,
      'submission_created',
      'User completed initial form submission',
      'form_submission',
      submissionId,
      {
        has_document_retrieval: hasDocumentRetrievalService,
        submission_state: 'new',
        timestamp: new Date().toISOString()
      }
    );
    
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
    
    // Enhanced activity logging for owners creation
    if (owners.length > 0) {
      await logUserActivity(
        userId,
        'owner_added',
        `Added ${owners.length} property owner(s)`,
        'owner',
        undefined,
        {
          owner_count: owners.length,
          submission_id: submissionId,
          owner_names: owners.map(o => `${o.firstName} ${o.lastName}`),
          timestamp: new Date().toISOString()
        }
      );

      // Log individual owner creations with enhanced ActivityLogger
      for (const owner of owners) {
        const ownerName = `${owner.firstName} ${owner.lastName}`;
        await ActivityLogger.logOwnerCreated(userId, owner.id, ownerName);
      }
    }
    
    // Save properties and get ID mappings
    console.log("[databaseService] Saving properties with userId:", userId);
    const propertyIdMap = await saveProperties(properties, submissionId, userId);
    console.log("[databaseService] Property ID mapping:", propertyIdMap);
    
    // Enhanced activity logging for properties creation
    if (properties.length > 0) {
      await logUserActivity(
        userId,
        'property_added',
        `Added ${properties.length} property/properties`,
        'property',
        undefined,
        {
          property_count: properties.length,
          submission_id: submissionId,
          property_labels: properties.map(p => p.label),
          property_types: properties.map(p => p.propertyType),
          timestamp: new Date().toISOString()
        }
      );

      // Log individual property creations with enhanced ActivityLogger
      for (const property of properties) {
        await ActivityLogger.logPropertyCreated(userId, property.id, property.label, property.propertyType);
      }
    }
    
    // Save owner-property assignments
    console.log("[databaseService] Saving assignments with userId:", userId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, submissionId, userId);
    console.log("[databaseService] Assignments saved successfully");
    
    // Enhanced activity logging for assignments creation
    if (assignments.length > 0) {
      await logUserActivity(
        userId,
        'assignment_created',
        `Created ${assignments.length} owner-property assignment(s)`,
        'assignment',
        undefined,
        {
          assignment_count: assignments.length,
          submission_id: submissionId,
          total_ownership_percentage: assignments.reduce((sum, a) => sum + (a.ownershipPercentage || 0), 0),
          timestamp: new Date().toISOString()
        }
      );

      // Log individual assignment creations with enhanced ActivityLogger
      for (const assignment of assignments) {
        const owner = owners.find(o => o.id === assignment.ownerId);
        const property = properties.find(p => p.id === assignment.propertyId);
        
        const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
        const propertyLabel = property?.label || 'Unknown Property';
        
        await ActivityLogger.logAssignmentCreated(userId, assignment.propertyId + assignment.ownerId, ownerName, propertyLabel);
      }
    }

    // Log the complete form submission
    await ActivityLogger.logFormSubmission(userId, submissionId, properties.length, owners.length);
    
    return { success: true };
  } catch (error) {
    console.error("[databaseService] Error saving form data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error saving form data')
    };
  }
};
