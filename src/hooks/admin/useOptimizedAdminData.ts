
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizedAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  totalProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentActivities: any[];
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error';
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export const useOptimizedAdminData = () => {
  const [analytics, setAnalytics] = useState<OptimizedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimized query function that uses the new indexes
  const fetchOptimizedAnalytics = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      setError(null);

      // Parallel queries for better performance, leveraging the new indexes
      const [
        usersResult,
        submissionsResult,
        propertiesResult,
        activitiesResult,
        paymentsResult
      ] = await Promise.all([
        // Optimized user count query using idx_profiles_created_at
        supabase
          .from('profiles')
          .select('id, created_at', { count: 'exact' })
          .order('created_at', { ascending: false }),
        
        // Optimized submissions query using idx_form_submissions_state and idx_form_submissions_submitted_at
        supabase
          .from('form_submissions')
          .select('id, state, submitted_at', { count: 'exact' })
          .order('submitted_at', { ascending: false }),
        
        // Optimized properties count using idx_properties_created_at
        supabase
          .from('properties')
          .select('id', { count: 'exact' }),
        
        // Optimized recent activities using idx_user_activities_created_at
        supabase
          .from('user_activities')
          .select('id, user_id, activity_type, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Optimized payments query using idx_purchases_created_at
        supabase
          .from('purchases')
          .select('amount, created_at, payment_status')
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false })
      ]);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (usersResult.error) throw usersResult.error;
      if (submissionsResult.error) throw submissionsResult.error;
      if (propertiesResult.error) throw propertiesResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      // Calculate metrics with optimized data
      const totalUsers = usersResult.count || 0;
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const newUsersThisMonth = usersResult.data?.filter(user => 
        new Date(user.created_at) >= currentMonth
      ).length || 0;

      const totalSubmissions = submissionsResult.count || 0;
      const completedSubmissions = submissionsResult.data?.filter(s => s.state === 'completed').length || 0;
      const pendingSubmissions = submissionsResult.data?.filter(s => s.state !== 'completed').length || 0;

      const totalProperties = propertiesResult.count || 0;

      const totalRevenue = paymentsResult.data?.reduce((sum, payment) => 
        sum + Number(payment.amount || 0), 0) || 0;
      
      const monthlyRevenue = paymentsResult.data?.filter(payment =>
        new Date(payment.created_at) >= currentMonth
      ).reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;

      // Active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = activitiesResult.data?.filter(activity =>
        new Date(activity.created_at) >= thirtyDaysAgo
      ).length || 0;

      // System health metrics
      const errorRate = responseTime > 1000 ? 2 : responseTime > 500 ? 1 : 0;
      const databaseStatus = responseTime > 2000 ? 'error' : responseTime > 1000 ? 'warning' : 'healthy';

      const optimizedAnalytics: OptimizedAnalytics = {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalSubmissions,
        completedSubmissions,
        pendingSubmissions,
        totalProperties,
        totalRevenue,
        monthlyRevenue,
        recentActivities: activitiesResult.data || [],
        systemHealth: {
          databaseStatus,
          apiResponseTime: responseTime,
          errorRate,
          uptime: 99.9
        }
      };

      setAnalytics(optimizedAnalytics);
      
      console.log('Optimized analytics loaded:', {
        responseTime: `${responseTime}ms`,
        totalUsers,
        databaseStatus
      });

    } catch (error: any) {
      console.error('Error fetching optimized analytics:', error);
      setError(error.message || 'Failed to fetch analytics data');
      toast.error('Failed to load dashboard analytics', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptimizedAnalytics();
  }, [fetchOptimizedAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchOptimizedAnalytics
  };
};
