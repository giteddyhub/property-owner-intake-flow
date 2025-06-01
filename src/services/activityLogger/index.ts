
import { ActivityLoggerCore } from './core';
import { AuthActivityLogger } from './authMethods';
import { EntityActivityLogger } from './entityMethods';
import { ActivityLogData } from './types';

/**
 * Main ActivityLogger class that combines all logging functionality
 * This provides a unified interface while keeping the implementation modular
 */
export class ActivityLogger {
  // Core logging method
  static async log(data: ActivityLogData): Promise<void> {
    return ActivityLoggerCore.log(data);
  }

  // Debug methods
  static getFailedLogs(): any[] {
    return ActivityLoggerCore.getFailedLogs();
  }

  static clearFailedLogs(): void {
    return ActivityLoggerCore.clearFailedLogs();
  }

  // Authentication methods
  static async logUserRegistration(userId: string, email: string): Promise<void> {
    return AuthActivityLogger.logUserRegistration(userId, email);
  }

  static async logUserLogin(userId: string, email?: string): Promise<void> {
    return AuthActivityLogger.logUserLogin(userId, email);
  }

  static async logProfileUpdate(userId: string, updatedFields: string[], email?: string): Promise<void> {
    return AuthActivityLogger.logProfileUpdate(userId, updatedFields, email);
  }

  // Owner methods
  static async logOwnerCreated(userId: string, ownerId: string, ownerName: string): Promise<void> {
    return EntityActivityLogger.logOwnerCreated(userId, ownerId, ownerName);
  }

  static async logOwnerUpdated(userId: string, ownerId: string, ownerName: string, updatedFields: string[]): Promise<void> {
    return EntityActivityLogger.logOwnerUpdated(userId, ownerId, ownerName, updatedFields);
  }

  static async logOwnerDeleted(userId: string, ownerId: string, ownerName: string): Promise<void> {
    return EntityActivityLogger.logOwnerDeleted(userId, ownerId, ownerName);
  }

  // Property methods
  static async logPropertyCreated(userId: string, propertyId: string, propertyLabel: string, propertyType: string): Promise<void> {
    return EntityActivityLogger.logPropertyCreated(userId, propertyId, propertyLabel, propertyType);
  }

  static async logPropertyUpdated(userId: string, propertyId: string, propertyLabel: string, updatedFields: string[]): Promise<void> {
    return EntityActivityLogger.logPropertyUpdated(userId, propertyId, propertyLabel, updatedFields);
  }

  static async logPropertyDeleted(userId: string, propertyId: string, propertyLabel: string): Promise<void> {
    return EntityActivityLogger.logPropertyDeleted(userId, propertyId, propertyLabel);
  }

  // Assignment methods
  static async logAssignmentCreated(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    return EntityActivityLogger.logAssignmentCreated(userId, assignmentId, ownerName, propertyLabel);
  }

  static async logAssignmentUpdated(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    return EntityActivityLogger.logAssignmentUpdated(userId, assignmentId, ownerName, propertyLabel);
  }

  static async logAssignmentDeleted(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    return EntityActivityLogger.logAssignmentDeleted(userId, assignmentId, ownerName, propertyLabel);
  }

  // Form submission method
  static async logFormSubmission(userId: string, submissionId: string, propertiesCount: number, ownersCount: number): Promise<void> {
    return EntityActivityLogger.logFormSubmission(userId, submissionId, propertiesCount, ownersCount);
  }
}

// Export types for external use
export type { ActivityLogData } from './types';
