
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = ({ userId, refreshFlag = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        console.log('No user ID provided to useDashboardData hook');
        setLoading(false);
        return;
      }

      console.log(`Fetching dashboard data for user ID: ${userId}`);
      setLoading(true);
      setError(null);

      try {
        // Fetch owners for this user
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', userId);

        if (ownersError) throw ownersError;
        console.log(`Fetched ${ownersData?.length || 0} owners`);

        // Fetch properties for this user
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', userId);

        if (propertiesError) throw propertiesError;
        console.log(`Fetched ${propertiesData?.length || 0} properties`);

        // Fetch assignments for this user
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('owner_property_assignments')
          .select('*, owner_id, property_id')
          .eq('user_id', userId);

        if (assignmentsError) throw assignmentsError;
        console.log(`Fetched ${assignmentsData?.length || 0} assignments`);

        // Set the data
        setOwners(ownersData || []);
        setProperties(propertiesData || []);
        setAssignments(assignmentsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId, refreshFlag]);

  return {
    loading,
    owners,
    properties,
    assignments,
    error,
  };
};
