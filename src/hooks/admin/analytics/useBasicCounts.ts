
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BasicCounts {
  userCount: number;
  propertyCount: number;
  submissionCount: number;
  ownerCount: number;
  completedCount: number;
  pendingCount: number;
  newUsersThisMonth: number;
}

export const useBasicCounts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBasicCounts = useCallback(async (): Promise<BasicCounts> => {
    setLoading(true);
    setError(null);

    try {
      // Fetch basic counts
      const [
        { count: userCount },
        { count: propertyCount },
        { count: submissionCount },
        { count: ownerCount },
        { count: completedCount },
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('owners').select('id', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('id', { count: 'exact' }).eq('state', 'completed'),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }).eq('state', 'pending')
      ]);

      // Fetch users created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      return {
        userCount: userCount || 0,
        propertyCount: propertyCount || 0,
        submissionCount: submissionCount || 0,
        ownerCount: ownerCount || 0,
        completedCount: completedCount || 0,
        pendingCount: pendingCount || 0,
        newUsersThisMonth: newUsersThisMonth || 0
      };
    } catch (err: any) {
      console.error('Error fetching basic counts:', err);
      setError(err.message || 'Failed to fetch basic counts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchBasicCounts,
    loading,
    error
  };
};
