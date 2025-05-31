
import { supabase } from '@/integrations/supabase/client';
import { UserActivityData } from '@/types/admin';

export const fetchActivities = async (userId: string): Promise<UserActivityData[]> => {
  console.log(`[activitiesService] Fetching activities for user: ${userId}`);
  
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[activitiesService] Error fetching activities:', error);
    return [];
  }

  console.log(`[activitiesService] Raw activities data:`, data);
  console.log(`[activitiesService] Found ${data?.length || 0} activities for user ${userId}`);

  const typedActivities = data?.map(activity => {
    console.log(`[activitiesService] Processing activity:`, {
      id: activity.id,
      activity_type: activity.activity_type,
      activity_description: activity.activity_description,
      entity_type: activity.entity_type,
      created_at: activity.created_at,
      metadata: activity.metadata
    });

    return {
      ...activity,
      metadata: (activity.metadata as any) || {}
    };
  }) || [];

  console.log(`[activitiesService] Returning ${typedActivities.length} typed activities`);
  return typedActivities;
};
