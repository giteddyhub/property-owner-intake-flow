
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { UserActivityData } from '@/types/admin';

export const fetchActivities = async (userId: string): Promise<UserActivityData[]> => {
  console.log(`[activitiesService] Fetching activities for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: activitiesData, error: activitiesError } = await adminClient
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (activitiesError) {
      console.error('[activitiesService] ❌ Error fetching activities:', activitiesError);
      // Don't throw error for activities as it's not critical - return empty array
      return [];
    }

    console.log(`[activitiesService] Raw activities data:`, activitiesData);

    // Convert activities data to match our UserActivityData interface
    const typedActivities: UserActivityData[] = activitiesData?.map(activity => ({
      ...activity,
      metadata: (activity.metadata as any) || {}
    })) || [];

    console.log(`[activitiesService] Found ${typedActivities.length} activities for user ${userId}`);
    console.log(`[activitiesService] Returning ${typedActivities.length} typed activities`);
    
    return typedActivities;
  } catch (error) {
    console.error('[activitiesService] ❌ Error in fetchActivities:', error);
    // Don't throw error for activities as it's not critical
    return [];
  }
};
