
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { saveOwners } from './ownerService';
import { saveProperties } from './propertyService';
import { saveAssignments } from './assignmentService';
import { logUserActivity } from './activityLoggingService';
import { ActivityLogger } from '@/services/activityLogger';

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
    console.log("[formDataSavingService] Saving owners with userId:", userId);
    const ownerIdMap = await saveOwners(owners, submissionId, userId);
    console.log("[formDataSavingService] Owner ID mapping:", ownerIdMap);
    
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
    console.log("[formDataSavingService] Saving properties with userId:", userId);
    const propertyIdMap = await saveProperties(properties, submissionId, userId);
    console.log("[formDataSavingService] Property ID mapping:", propertyIdMap);
    
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
    console.log("[formDataSavingService] Saving assignments with userId:", userId);
    await saveAssignments(assignments, ownerIdMap, propertyIdMap, submissionId, userId);
    console.log("[formDataSavingService] Assignments saved successfully");
    
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
    console.error("[formDataSavingService] Error saving form data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error saving form data')
    };
  }
};
