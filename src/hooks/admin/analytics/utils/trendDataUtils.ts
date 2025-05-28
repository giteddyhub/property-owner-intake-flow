
import { supabase } from '@/integrations/supabase/client';

export interface GrowthData {
  date: string;
  users: number;
  submissions: number;
  properties: number;
}

export interface TrendData {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

export const fetchUserGrowthData = async (): Promise<GrowthData[]> => {
  const data: GrowthData[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [userResult, submissionResult, propertyResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gte('created_at', dateStr).lt('created_at', nextDateStr),
      supabase.from('form_submissions').select('id', { count: 'exact', head: true })
        .gte('created_at', dateStr).lt('created_at', nextDateStr),
      supabase.from('properties').select('id', { count: 'exact', head: true })
        .gte('created_at', dateStr).lt('created_at', nextDateStr)
    ]);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: userResult.count || 0,
      submissions: submissionResult.count || 0,
      properties: propertyResult.count || 0
    });
  }

  return data;
};

export const fetchSubmissionTrends = async (): Promise<TrendData[]> => {
  const trends: TrendData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [completedResult, pendingResult] = await Promise.all([
      supabase.from('form_submissions').select('id', { count: 'exact', head: true })
        .eq('state', 'completed')
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', endOfMonth.toISOString()),
      supabase.from('form_submissions').select('id', { count: 'exact', head: true })
        .eq('state', 'pending')
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', endOfMonth.toISOString())
    ]);

    const completed = completedResult.count || 0;
    const pending = pendingResult.count || 0;

    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      completed,
      pending,
      total: completed + pending
    });
  }

  return trends;
};
