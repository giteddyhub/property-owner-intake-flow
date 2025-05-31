
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { AssignmentData } from '@/types/admin';

export const fetchAssignments = async (userId: string): Promise<AssignmentData[]> => {
  console.log(`[assignmentsService] 🔍 Fetching assignments for user: ${userId}`);
  
  try {
    const adminClient = getAuthenticatedAdminClient();
    
    const { data: assignmentsData, error: assignmentsError } = await adminClient
      .from('owner_property_assignments')
      .select(`
        *,
        properties!owner_property_assignments_property_id_fkey (label),
        owners!owner_property_assignments_owner_id_fkey (first_name, last_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (assignmentsError) {
      console.error('[assignmentsService] ❌ Error fetching assignments:', assignmentsError);
      throw assignmentsError;
    }

    // Process assignments data
    const enhancedAssignments = assignmentsData?.map(assignment => ({
      ...assignment,
      property_label: assignment.properties?.label || 'Unknown Property',
      owner_name: assignment.owners ? 
        `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
    })) || [];

    console.log(`[assignmentsService] ✅ Found ${enhancedAssignments.length} assignments for user ${userId}`);
    return enhancedAssignments;
  } catch (error) {
    console.error('[assignmentsService] ❌ Error in fetchAssignments:', error);
    throw error;
  }
};
