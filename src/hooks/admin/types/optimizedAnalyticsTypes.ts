
export interface OptimizedAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  totalProperties: number;
  totalOwners: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentActivities: any[];
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error';
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
    lastChecked: string;
  };
  userGrowthData: Array<{
    date: string;
    users: number;
    sessions: number;
    properties: number;
  }>;
  sessionTrends: Array<{
    month: string;
    completed: number;
    pending: number;
    total: number;
  }>;
  propertyDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    previousMonthRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    monthlyGrowthRate: number;
  };
  growthMetrics: {
    userGrowthRate: number;
    revenueGrowthRate: number;
    sessionGrowthRate: number;
  };
}
