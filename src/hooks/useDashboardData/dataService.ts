
import { supabase } from '@/integrations/supabase/client';
import { transformOwnerData, transformPropertyData, transformAssignmentData } from './transformers';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

// Extended assignment type that includes ID for internal use
export interface AssignmentWithId extends OwnerPropertyAssignment {
  id: string;
}

export const fetchDashboardData = async (userId: string) => {
  console.log('Fetching dashboard data for user:', userId);
  
  // Fetch owners
  const { data: ownersData, error: ownersError } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ownersError) {
    console.error('Error fetching owners:', ownersError);
    throw ownersError;
  }

  console.log('Fetched owners:', ownersData?.length || 0);
  const owners = (ownersData || []).map(transformOwnerData);

  // Fetch properties
  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError);
    throw propertiesError;
  }

  console.log('Fetched properties:', propertiesData?.length || 0);
  const properties = (propertiesData || []).map(transformPropertyData);

  // Fetch assignments
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('owner_property_assignments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError);
    throw assignmentsError;
  }

  console.log('Fetched assignments:', assignmentsData?.length || 0);
  
  // Transform assignments with error handling
  const assignments: AssignmentWithId[] = [];
  (assignmentsData || []).forEach(dbAssignment => {
    try {
      const transformed = transformAssignmentData(dbAssignment) as AssignmentWithId;
      assignments.push(transformed);
    } catch (error) {
      console.error('Failed to transform assignment, skipping:', error, dbAssignment);
    }
  });

  console.log('Dashboard data fetch completed successfully');
  
  return {
    owners,
    properties,
    assignments
  };
};
