
import { getAuthenticatedAdminClient } from '@/integrations/supabase/adminClient';
import { OptimizedAnalytics } from '../types/optimizedAnalyticsTypes';
import { getMonthBoundaries } from '../utils/dateUtils';
import { fetchPaymentData } from './paymentDataService';
import { fetchUserMetrics } from './userMetricsService';
import { calculateGrowthMetrics } from './growthMetricsService';
import { generateTrendData } from './trendDataService';

export const fetchOptimizedAnalyticsData = async (): Promise<OptimizedAnalytics> => {
  const startTime = Date.now();
  
  // Get authenticated admin client
  let adminSupabase;
  try {
    adminSupabase = getAuthenticatedAdminClient();
    console.log('✅ Successfully obtained authenticated admin client');
  } catch (adminError: any) {
    console.error('❌ Failed to get authenticated admin client:', adminError);
    throw new Error(`Admin authentication failed: ${adminError.message}`);
  }

  // Get current and previous month boundaries
  const currentMonth = getMonthBoundaries(0);
  const previousMonth = getMonthBoundaries(1);

  console.log('📅 REVENUE DEBUG - Month boundaries:', {
    currentMonth: { 
      start: currentMonth.startOfMonth.toISOString(), 
      end: currentMonth.endOfMonth.toISOString() 
    },
    previousMonth: { 
      start: previousMonth.startOfMonth.toISOString(), 
      end: previousMonth.endOfMonth.toISOString() 
    }
  });

  console.log('🚀 REVENUE DEBUG - Starting payment queries with ADMIN CLIENT...');

  // Execute queries with ADMIN CLIENT
  const [
    userSummaryResult,
    submissionsResult,
    activitiesResult,
    recentActivitiesResult
  ] = await Promise.all([
    adminSupabase
      .from('admin_user_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .then(result => {
        if (result.error) console.error('❌ USER SUMMARY ERROR:', result.error);
        return result;
      }),
    
    adminSupabase
      .from('form_submissions')
      .select('id, state, submitted_at, created_at')
      .order('submitted_at', { ascending: false })
      .then(result => {
        if (result.error) console.error('❌ SUBMISSIONS ERROR:', result.error);
        return result;
      }),
    
    adminSupabase
      .from('user_activities')
      .select('user_id, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .then(result => {
        if (result.error) console.error('❌ ACTIVITIES ERROR:', result.error);
        return result;
      }),

    adminSupabase
      .from('user_activities')
      .select('id, user_id, activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(result => {
        if (result.error) console.error('❌ RECENT ACTIVITIES ERROR:', result.error);
        return result;
      })
  ]);

  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // Fetch payment data
  const { totalRevenue, currentMonthRevenue, previousMonthRevenue } = await fetchPaymentData(
    adminSupabase, 
    currentMonth, 
    previousMonth
  );

  // Fetch user metrics
  const userMetrics = await fetchUserMetrics(
    adminSupabase,
    userSummaryResult.data || [],
    currentMonth,
    previousMonth
  );

  // Calculate basic metrics
  const totalSubmissions = submissionsResult.data?.length || 0;
  const completedSubmissions = submissionsResult.data?.filter(s => s.state === 'completed').length || 0;
  const pendingSubmissions = submissionsResult.data?.filter(s => s.state !== 'completed').length || 0;

  // Calculate active users from recent activities
  const uniqueActiveUsers = new Set((activitiesResult.data || []).map(a => a.user_id));
  const activeUsers = uniqueActiveUsers.size;

  // Calculate growth rates
  const growthMetrics = calculateGrowthMetrics({
    newUsersThisMonth: userMetrics.newUsersThisMonth,
    newUsersPreviousMonth: userMetrics.newUsersPreviousMonth,
    currentMonthRevenue,
    previousMonthRevenue,
    submissionsResult: submissionsResult.data || [],
    currentMonth,
    previousMonth
  });

  const errorRate = responseTime > 1000 ? 2 : responseTime > 500 ? 1 : 0;
  const databaseStatus = responseTime > 2000 ? 'error' : responseTime > 1000 ? 'warning' : 'healthy';

  // Generate trend data
  const trendData = await generateTrendData(adminSupabase, userMetrics, totalSubmissions);

  // Revenue metrics calculations
  const validPaymentCount = totalRevenue > 0 ? Math.max(1, Math.round(totalRevenue / 295)) : 0;
  const averageOrderValue = validPaymentCount > 0 ? totalRevenue / validPaymentCount : 0;
  const conversionRate = userMetrics.totalUsers > 0 ? (completedSubmissions / userMetrics.totalUsers) * 100 : 0;

  const optimizedAnalytics: OptimizedAnalytics = {
    totalUsers: userMetrics.totalUsers,
    activeUsers,
    newUsersThisMonth: userMetrics.newUsersThisMonth,
    totalSubmissions,
    completedSubmissions,
    pendingSubmissions,
    totalProperties: userMetrics.totalProperties,
    totalOwners: userMetrics.totalOwners,
    totalRevenue,
    monthlyRevenue: currentMonthRevenue,
    recentActivities: recentActivitiesResult.data || [],
    systemHealth: {
      databaseStatus,
      apiResponseTime: responseTime,
      errorRate,
      uptime: 99.9,
      lastChecked: new Date().toISOString()
    },
    userGrowthData: trendData.userGrowthData,
    sessionTrends: trendData.sessionTrends,
    propertyDistribution: trendData.propertyDistribution,
    revenueMetrics: {
      totalRevenue,
      monthlyRevenue: currentMonthRevenue,
      previousMonthRevenue,
      averageOrderValue,
      conversionRate,
      monthlyGrowthRate: growthMetrics.revenueGrowthRate
    },
    growthMetrics: {
      userGrowthRate: isNaN(growthMetrics.userGrowthRate) ? 0 : growthMetrics.userGrowthRate,
      revenueGrowthRate: isNaN(growthMetrics.revenueGrowthRate) ? 0 : growthMetrics.revenueGrowthRate,
      sessionGrowthRate: isNaN(growthMetrics.sessionGrowthRate) ? 0 : growthMetrics.sessionGrowthRate
    }
  };

  return optimizedAnalytics;
};
