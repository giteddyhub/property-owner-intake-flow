
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

interface UseDashboardDataProps {
  userId: string | undefined;
  refreshFlag?: number;
}

interface UseDashboardDataReturn {
  loading: boolean;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

export const useDashboardData = ({ userId, refreshFlag = 0 }: UseDashboardDataProps): UseDashboardDataReturn => {
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);

  useEffect(() => {
    // Don't try to fetch data if no userId is available
    if (!userId) {
      console.log("No userId provided to useDashboardData, skipping data fetch");
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const result = await fetchUserData({ userId });
        
        if (result.error) {
          throw result.error;
        }
        
        // Map the data to the expected formats with explicit typing
        const mappedOwners = mapDbOwnersToOwners(result.ownersData);
        const mappedProperties = mapDbPropertiesToProperties(result.propertiesData);
        const mappedAssignments = mapDbAssignmentsToAssignments(result.assignmentsData);
        
        setOwners(mappedOwners);
        setProperties(mappedProperties);
        setAssignments(mappedAssignments);
        
        if (!result.ownersData.length && !result.propertiesData.length && !result.assignmentsData.length) {
          console.warn("No data found for this user. This might be expected for new users.");
        } else {
          console.log(`Found ${result.ownersData.length} owners, ${result.propertiesData.length} properties, ${result.assignmentsData.length} assignments`);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load your data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, refreshFlag]);

  return { loading, owners, properties, assignments };
};
