
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AccountData, OwnerData, PropertyData, AssignmentData } from '@/types/admin';

interface UserOverviewData {
  account?: AccountData;
  owners: OwnerData[];
  properties: PropertyData[];
  assignments: AssignmentData[];
}

export const useUserOverview = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOverview = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch account info
      const { data: accountData, error: accountError } = await supabase
        .from('admin_user_summary')
        .select('*')
        .eq('id', userId)
        .single();

      if (accountError && accountError.code !== 'PGRST116') {
        throw accountError;
      }

      // Fetch owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ownersError) throw ownersError;

      // Fetch properties with documents and document retrieval service info
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch assignments with explicit column selection to avoid ambiguity
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select(`
          id,
          property_id,
          owner_id,
          ownership_percentage,
          resident_at_property,
          created_at,
          properties!inner(label),
          owners!inner(first_name, last_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Transform assignments data
      const transformedAssignments: AssignmentData[] = assignmentsData?.map(assignment => ({
        id: assignment.id,
        property_id: assignment.property_id,
        owner_id: assignment.owner_id,
        ownership_percentage: assignment.ownership_percentage,
        resident_at_property: assignment.resident_at_property,
        property_label: (assignment.properties as any)?.label || 'Unknown Property',
        owner_name: (assignment.owners as any) ? `${(assignment.owners as any).first_name} ${(assignment.owners as any).last_name}` : 'Unknown Owner',
        created_at: assignment.created_at
      })) || [];

      // Transform account data to match AccountData interface
      const transformedAccount: AccountData | undefined = accountData ? {
        id: accountData.id,
        email: accountData.email,
        full_name: accountData.full_name,
        created_at: accountData.created_at,
        updated_at: accountData.created_at, // Use created_at as fallback
        submissions_count: Number(accountData.total_submissions || 0),
        properties_count: Number(accountData.total_properties || 0),
        owners_count: Number(accountData.total_owners || 0),
        is_admin: false,
        primary_submission_id: accountData.primary_submission_id
      } : undefined;

      setData({
        account: transformedAccount,
        owners: ownersData || [],
        properties: propertiesData || [],
        assignments: transformedAssignments
      });

    } catch (err: any) {
      console.error('Error fetching user overview:', err);
      setError(err.message || 'Failed to fetch user overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    data,
    error,
    fetchUserOverview,
    clearData
  };
};
