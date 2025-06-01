
import { supabase } from '@/integrations/supabase/client';
import { ActivityLogData } from './types';

/**
 * Core activity logging functionality with comprehensive error handling
 */
export class ActivityLoggerCore {
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
}
