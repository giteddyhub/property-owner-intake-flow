
import { ActivityLoggerCore } from './core';

/**
 * Entity-specific activity logging methods
 */
export class EntityActivityLogger {
  // Owner-related methods
  static async logOwnerCreated(userId: string, ownerId: string, ownerName: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'owner_created',
      activityDescription: `Created property owner: ${ownerName}`,
      entityType: 'owner',
      entityId: ownerId,
      metadata: {
        owner_name: ownerName,
        creation_timestamp: new Date().toISOString()
      }
    });
  }

  static async logOwnerUpdated(userId: string, ownerId: string, ownerName: string, updatedFields: string[]): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'owner_updated',
      activityDescription: `Updated property owner: ${ownerName}`,
      entityType: 'owner',
      entityId: ownerId,
      metadata: {
        owner_name: ownerName,
        updated_fields: updatedFields,
        update_timestamp: new Date().toISOString()
      }
    });
  }

  static async logOwnerDeleted(userId: string, ownerId: string, ownerName: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'owner_deleted',
      activityDescription: `Deleted property owner: ${ownerName}`,
      entityType: 'owner',
      entityId: ownerId,
      metadata: {
        owner_name: ownerName,
        deletion_timestamp: new Date().toISOString()
      }
    });
  }

  // Property-related methods
  static async logPropertyCreated(userId: string, propertyId: string, propertyLabel: string, propertyType: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'property_created',
      activityDescription: `Created property: ${propertyLabel}`,
      entityType: 'property',
      entityId: propertyId,
      metadata: {
        property_label: propertyLabel,
        property_type: propertyType,
        creation_timestamp: new Date().toISOString()
      }
    });
  }

  static async logPropertyUpdated(userId: string, propertyId: string, propertyLabel: string, updatedFields: string[]): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'property_updated',
      activityDescription: `Updated property: ${propertyLabel}`,
      entityType: 'property',
      entityId: propertyId,
      metadata: {
        property_label: propertyLabel,
        updated_fields: updatedFields,
        update_timestamp: new Date().toISOString()
      }
    });
  }

  static async logPropertyDeleted(userId: string, propertyId: string, propertyLabel: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'property_deleted',
      activityDescription: `Deleted property: ${propertyLabel}`,
      entityType: 'property',
      entityId: propertyId,
      metadata: {
        property_label: propertyLabel,
        deletion_timestamp: new Date().toISOString()
      }
    });
  }

  // Assignment-related methods
  static async logAssignmentCreated(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'assignment_created',
      activityDescription: `Created assignment: ${ownerName} → ${propertyLabel}`,
      entityType: 'assignment',
      entityId: assignmentId,
      metadata: {
        owner_name: ownerName,
        property_label: propertyLabel,
        creation_timestamp: new Date().toISOString()
      }
    });
  }

  static async logAssignmentUpdated(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'assignment_updated',
      activityDescription: `Updated assignment: ${ownerName} → ${propertyLabel}`,
      entityType: 'assignment',
      entityId: assignmentId,
      metadata: {
        owner_name: ownerName,
        property_label: propertyLabel,
        update_timestamp: new Date().toISOString()
      }
    });
  }

  static async logAssignmentDeleted(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'assignment_deleted',
      activityDescription: `Deleted assignment: ${ownerName} → ${propertyLabel}`,
      entityType: 'assignment',
      entityId: assignmentId,
      metadata: {
        owner_name: ownerName,
        property_label: propertyLabel,
        deletion_timestamp: new Date().toISOString()
      }
    });
  }

  // Form submission method
  static async logFormSubmission(userId: string, submissionId: string, propertiesCount: number, ownersCount: number): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'form_submitted',
      activityDescription: `Submitted tax form with ${propertiesCount} properties and ${ownersCount} owners`,
      entityType: 'form_submission',
      entityId: submissionId,
      metadata: {
        properties_count: propertiesCount,
        owners_count: ownersCount,
        submission_timestamp: new Date().toISOString()
      }
    });
  }
}
