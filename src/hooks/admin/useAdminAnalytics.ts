
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminAnalytics {
  totalUsers: number;
  totalProperties: number;
  totalSubmissions: number;
  totalOwners: number;
  newUsersThisMonth: number;
  completedSubmissions: number;
  activeUsers: number;
  recentActivity: ActivityItem[];
  userGrowth: GrowthData[];
  submissionTrends: TrendData[];
}

export interface ActivityItem {
  id: string;
  type: 'user_signup' | 'submission_completed' | 'property_added' | 'admin_action';
  description: string;
  timestamp: string;
  user_email?: string;
}

export interface GrowthData {
  date: string;
  users: number;
  submissions: number;
}

export interface TrendData {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch basic counts
      const [
        { count: userCount },
        { count: propertyCount },
        { count: submissionCount },
        { count: ownerCount }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('owners').select('id', { count: 'exact', head: true })
      ]);

      // Fetch users created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch completed submissions
      const { count: completedSubmissions } = await supabase
        .from('form_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('state', 'completed');

      // Generate recent activity (mock data for now)
      const recentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user_email: 'user@example.com'
        },
        {
          id: '2',
          type: 'submission_completed',
          description: 'Form submission completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: '3',
          type: 'property_added',
          description: 'New property added',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        }
      ];

      // Generate user growth data (last 30 days)
      const userGrowth: GrowthData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        userGrowth.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 5) + 1,
          submissions: Math.floor(Math.random() * 3)
        });
      }

      // Generate submission trends (last 6 months)
      const submissionTrends: TrendData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const completed = Math.floor(Math.random() * 50) + 10;
        const pending = Math.floor(Math.random() * 20) + 5;
        submissionTrends.push({
          month,
          completed,
          pending,
          total: completed + pending
        });
      }

      setAnalytics({
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalSubmissions: submissionCount || 0,
        totalOwners: ownerCount || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        completedSubmissions: completedSubmissions || 0,
        activeUsers: Math.floor((userCount || 0) * 0.3), // Estimate 30% active
        recentActivity,
        userGrowth,
        submissionTrends
      });

    } catch (err: any) {
      console.error('Error fetching admin analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
