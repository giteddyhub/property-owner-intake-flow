
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { PropertyData } from '@/types/admin';

export const fetchProperties = async (userId: string): Promise<PropertyData[]> => {
  console.log(`[propertiesService] 🔍 Fetching properties for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: propertiesData, error: propertiesError } = await adminClient
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('[propertiesService] ❌ Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    console.log(`[propertiesService] ✅ Found ${propertiesData?.length || 0} properties for user ${userId}`);
    return propertiesData || [];
  } catch (error) {
    console.error('[propertiesService] ❌ Error in fetchProperties:', error);
    throw error;
  }
};
