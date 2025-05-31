
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { OwnerData } from '@/types/admin';

export const fetchOwners = async (userId: string): Promise<OwnerData[]> => {
  console.log(`[ownersService] 🔍 Fetching owners for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: ownersData, error: ownersError } = await adminClient
      .from('owners')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ownersError) {
      console.error('[ownersService] ❌ Error fetching owners:', ownersError);
      throw ownersError;
    }

    console.log(`[ownersService] ✅ Found ${ownersData?.length || 0} owners for user ${userId}`);
    return ownersData || [];
  } catch (error) {
    console.error('[ownersService] ❌ Error in fetchOwners:', error);
    throw error;
  }
};
