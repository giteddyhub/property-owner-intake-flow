
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced activity logging function with better error handling
 */
export const logUserActivity = async (
  userId: string,
  activityType: string,
  activityDescription: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) => {
  try {
    console.log(`[activityLoggingService] Logging activity for user ${userId}:`, {
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
      console.error('[activityLoggingService] Failed to log user activity:', error);
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
        console.error('[activityLoggingService] Direct insert also failed:', insertError);
      } else {
        console.log('[activityLoggingService] Activity logged via direct insert');
      }
    } else {
      console.log('[activityLoggingService] Activity logged successfully via RPC:', data);
    }
  } catch (error) {
    console.error('[activityLoggingService] Exception during activity logging:', error);
  }
};
