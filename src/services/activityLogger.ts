
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogData {
  userId: string;
  activityType: string;
  activityDescription: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced activity logging service with comprehensive error handling and debugging
 */
export class ActivityLogger {
  private static async logDirectly(data: ActivityLogData): Promise<boolean> {
    try {
      console.log('[ActivityLogger] 🔄 Attempting direct insert:', data);
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: data.userId,
          activity_type: data.activityType,
          activity_description: data.activityDescription,
          entity_type: data.entityType || null,
          entity_id: data.entityId || null,
          metadata: data.metadata || {}
        });

      if (error) {
        console.error('[ActivityLogger] ❌ Direct insert failed:', error);
        return false;
      }

      console.log('[ActivityLogger] ✅ Direct insert successful');
      return true;
    } catch (error) {
      console.error('[ActivityLogger] 💥 Exception during direct insert:', error);
      return false;
    }
  }

  private static async logViaRPC(data: ActivityLogData): Promise<boolean> {
    try {
      console.log('[ActivityLogger] 🔄 Attempting RPC call:', data);
      
      const { data: result, error } = await supabase.rpc('log_user_activity', {
        user_id: data.userId,
        activity_type: data.activityType,
        activity_description: data.activityDescription,
        entity_type: data.entityType || null,
        entity_id: data.entityId || null,
        metadata: data.metadata || {}
      });

      if (error) {
        console.error('[ActivityLogger] ❌ RPC call failed:', error);
        return false;
      }

      console.log('[ActivityLogger] ✅ RPC call successful:', result);
      return true;
    } catch (error) {
      console.error('[ActivityLogger] 💥 Exception during RPC call:', error);
      return false;
    }
  }

  /**
   * Enhanced log method with comprehensive error handling and debugging
   */
  static async log(data: ActivityLogData): Promise<void> {
    console.log('[ActivityLogger] 📝 Logging activity:', {
      userId: data.userId,
      activityType: data.activityType,
      description: data.activityDescription
    });

    if (!data.userId) {
      console.error('[ActivityLogger] ❌ No userId provided, skipping log');
      return;
    }

    // Try RPC first, then direct insert as fallback
    const rpcSuccess = await this.logViaRPC(data);
    
    if (!rpcSuccess) {
      console.log('[ActivityLogger] 🔄 RPC failed, trying direct insert...');
      const directSuccess = await this.logDirectly(data);
      
      if (!directSuccess) {
        console.error('[ActivityLogger] ❌ All logging methods failed for:', data);
        // Store failed logs in localStorage for debugging
        this.storeFailed(data);
      }
    }
  }

  /**
   * Store failed logs for debugging
   */
  private static storeFailed(data: ActivityLogData): void {
    try {
      const failed = JSON.parse(localStorage.getItem('failed_activity_logs') || '[]');
      failed.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('failed_activity_logs', JSON.stringify(failed.slice(-50))); // Keep last 50
    } catch (error) {
      console.error('[ActivityLogger] Failed to store failed log:', error);
    }
  }

  /**
   * Get failed logs for debugging
   */
  static getFailedLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('failed_activity_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear failed logs
   */
  static clearFailedLogs(): void {
    localStorage.removeItem('failed_activity_logs');
  }

  // Enhanced logging methods with better metadata
  static async logUserRegistration(userId: string, email: string): Promise<void> {
    await this.log({
      userId,
      activityType: 'user_registration',
      activityDescription: 'User completed registration',
      entityType: 'user',
      entityId: userId,
      metadata: {
        email,
        registration_timestamp: new Date().toISOString(),
        source: 'signup_form'
      }
    });
  }

  static async logUserLogin(userId: string, email?: string): Promise<void> {
    await this.log({
      userId,
      activityType: 'user_login',
      activityDescription: 'User logged in',
      entityType: 'session',
      metadata: {
        email,
        login_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        source: 'login_form'
      }
    });
  }

  static async logProfileUpdate(userId: string, updatedFields: string[], email?: string): Promise<void> {
    await this.log({
      userId,
      activityType: 'profile_updated',
      activityDescription: `Updated profile fields: ${updatedFields.join(', ')}`,
      entityType: 'profile',
      entityId: userId,
      metadata: {
        updated_fields: updatedFields,
        email,
        update_timestamp: new Date().toISOString()
      }
    });
  }

  static async logOwnerCreated(userId: string, ownerId: string, ownerName: string): Promise<void> {
    await this.log({
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
    await this.log({
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
    await this.log({
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

  static async logPropertyCreated(userId: string, propertyId: string, propertyLabel: string, propertyType: string): Promise<void> {
    await this.log({
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
    await this.log({
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
    await this.log({
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

  static async logAssignmentCreated(userId: string, assignmentId: string, ownerName: string, propertyLabel: string): Promise<void> {
    await this.log({
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
    await this.log({
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
    await this.log({
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

  static async logFormSubmission(userId: string, submissionId: string, propertiesCount: number, ownersCount: number): Promise<void> {
    await this.log({
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
