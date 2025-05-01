
import { useState, useEffect } from 'react';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment
} from '@/components/dashboard/types';
import { toast } from 'sonner';
import { fetchUserData } from './dashboard/api/fetchDashboardData';
import { mapDbOwnersToOwners } from './dashboard/mappers/ownerMapper';
import { mapDbPropertiesToProperties } from './dashboard/mappers/propertyMapper';
import { mapDbAssignmentsToAssignments } from './dashboard/mappers/assignmentMapper';
import { supabase } from '@/integrations/supabase/client';

interface UseDashboardDataProps {
  userId: string | undefined;
  refreshFlag?: number;
}

interface UseDashboardDataReturn {
  loading: boolean;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  error: Error | null;
}

export const useDashboardData = ({ userId, refreshFlag = 0 }: UseDashboardDataProps): UseDashboardDataReturn => {
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't try to fetch data if no userId is available
    if (!userId) {
      console.log("No userId provided to useDashboardData, skipping data fetch");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const loadUserData = async () => {
      try {
        console.log("Fetching dashboard data for userId:", userId);
        
        // Debug: Check if user exists in auth.users
        const { data: authData, error: authError } = await supabase.auth.getUser();
        console.log("Current authenticated user:", authData?.user?.id);
        console.log("Using userId for fetch:", userId);
        console.log("Match between auth and param:", authData?.user?.id === userId);
        
        // Debug: Try a direct query to check data existence
        const { data: directOwners, error: directOwnersError } = await supabase
          .from('owners')
          .select('id')
          .eq('user_id', userId);
        
        console.log("Direct query for owners result:", {
          count: directOwners?.length || 0,
          error: directOwnersError
        });
        
        const result = await fetchUserData({ userId });
        
        if (!isMounted) return;
        
        if (result.error) {
          throw result.error;
        }
        
        // Map the data to the expected formats with explicit typing
        const mappedOwners = mapDbOwnersToOwners(result.ownersData);
        const mappedProperties = mapDbPropertiesToProperties(result.propertiesData);
        const mappedAssignments = mapDbAssignmentsToAssignments(result.assignmentsData);
        
        console.log("Dashboard data fetched:", {
          owners: mappedOwners.length,
          properties: mappedProperties.length,
          assignments: mappedAssignments.length
        });
        
        setOwners(mappedOwners);
        setProperties(mappedProperties);
        setAssignments(mappedAssignments);
        
        if (!result.ownersData.length && !result.propertiesData.length && !result.assignmentsData.length) {
          console.warn("No data found for this user. This might be expected for new users.");
          
          // Debug: Check if this user has any contact records
          const { data: contactData, error: contactError } = await supabase
            .from('contacts')
            .select('id')
            .eq('user_id', userId);
            
          console.log("Contact records for this user:", {
            count: contactData?.length || 0,
            error: contactError
          });
        } else {
          console.log(`Found ${result.ownersData.length} owners, ${result.propertiesData.length} properties, ${result.assignmentsData.length} assignments`);
        }
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error : new Error('Unknown error fetching dashboard data'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [userId, refreshFlag]);

  return { loading, owners, properties, assignments, error };
};
