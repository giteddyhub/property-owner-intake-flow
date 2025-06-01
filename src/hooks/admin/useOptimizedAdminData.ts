
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { OptimizedAnalytics } from './types/optimizedAnalyticsTypes';
import { fetchOptimizedAnalyticsData } from './services/analyticsDataService';

export const useOptimizedAdminData = () => {
  const [analytics, setAnalytics] = useState<OptimizedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimizedAnalytics = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      setError(null);

      const optimizedAnalytics = await fetchOptimizedAnalyticsData();
      setAnalytics(optimizedAnalytics);
      
      const responseTime = Date.now() - startTime;
      console.log('✅ REVENUE DEBUG COMPLETE (ADMIN CLIENT) - Final Analytics:', {
        totalRevenue: optimizedAnalytics.totalRevenue,
        monthlyRevenue: optimizedAnalytics.monthlyRevenue,
        revenueMetrics: optimizedAnalytics.revenueMetrics,
        queryResponseTime: `${responseTime}ms`
      });

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in fetchOptimizedAnalytics:', error);
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
