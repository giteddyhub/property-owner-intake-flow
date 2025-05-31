
import { supabase } from '@/integrations/supabase/client';
import { AssignmentData } from '@/types/admin';

export const fetchAssignments = async (userId: string): Promise<AssignmentData[]> => {
  const { data } = await supabase
    .from('owner_property_assignments')
    .select(`
      *,
      properties!owner_property_assignments_property_id_fkey (label),
      owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data?.map(assignment => ({
    ...assignment,
    property_label: assignment.properties?.label || 'Unknown Property',
    owner_name: assignment.owners ? 
      `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
  })) || [];
};
