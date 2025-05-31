
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
 * Centralized activity logging service with enhanced error handling and fallbacks
 */
export class ActivityLogger {
  private static async logDirectly(data: ActivityLogData): Promise<boolean> {
    try {
      console.log('[ActivityLogger] Attempting direct insert:', data);
      
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
        console.error('[ActivityLogger] Direct insert failed:', error);
        return false;
      }

      console.log('[ActivityLogger] Direct insert successful');
      return true;
    } catch (error) {
      console.error('[ActivityLogger] Exception during direct insert:', error);
      return false;
    }
  }

  private static async logViaRPC(data: ActivityLogData): Promise<boolean> {
    try {
      console.log('[ActivityLogger] Attempting RPC call:', data);
      
      const { data: result, error } = await supabase.rpc('log_user_activity', {
        user_id: data.userId,
        activity_type: data.activityType,
        activity_description: data.activityDescription,
        entity_type: data.entityType || null,
        entity_id: data.entityId || null,
        metadata: data.metadata || {}
      });

      if (error) {
        console.error('[ActivityLogger] RPC call failed:', error);
        return false;
      }

      console.log('[ActivityLogger] RPC call successful:', result);
      return true;
    } catch (error) {
      console.error('[ActivityLogger] Exception during RPC call:', error);
      return false;
    }
  }

  /**
   * Log user activity with multiple fallback methods
   */
  static async log(data: ActivityLogData): Promise<void> {
    console.log('[ActivityLogger] Logging activity:', data);

    // Try RPC first, then direct insert as fallback
    const rpcSuccess = await this.logViaRPC(data);
    
    if (!rpcSuccess) {
      console.log('[ActivityLogger] RPC failed, trying direct insert...');
      const directSuccess = await this.logDirectly(data);
      
      if (!directSuccess) {
        console.error('[ActivityLogger] All logging methods failed for:', data);
      }
    }
  }

  /**
   * Log user registration activity
   */
  static async logUserRegistration(userId: string, email: string): Promise<void> {
    await this.log({
      userId,
      activityType: 'user_registration',
      activityDescription: 'User completed registration',
      entityType: 'user',
      entityId: userId,
      metadata: {
        email,
        registration_timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log profile update activity
   */
  static async logProfileUpdate(userId: string, updatedFields: string[]): Promise<void> {
    await this.log({
      userId,
      activityType: 'profile_updated',
      activityDescription: `Updated profile fields: ${updatedFields.join(', ')}`,
      entityType: 'profile',
      entityId: userId,
      metadata: {
        updated_fields: updatedFields,
        update_timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log login activity
   */
  static async logUserLogin(userId: string): Promise<void> {
    await this.log({
      userId,
      activityType: 'user_login',
      activityDescription: 'User logged in',
      entityType: 'session',
      metadata: {
        login_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    });
  }
}
