
import { supabase } from '@/integrations/supabase/client';
import { PropertyData } from '@/types/admin';

export const fetchProperties = async (userId: string): Promise<PropertyData[]> => {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
};
