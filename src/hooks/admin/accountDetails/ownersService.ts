
import { supabase } from '@/integrations/supabase/client';
import { OwnerData } from '@/types/admin';

export const fetchOwners = async (userId: string): Promise<OwnerData[]> => {
  const { data } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
};
