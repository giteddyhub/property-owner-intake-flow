
export interface PropertyDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface SystemHealth {
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: string;
}

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

export interface RealTimeAnalytics {
  totalUsers: number;
  totalProperties: number;
  totalSubmissions: number;
  totalOwners: number;
  newUsersThisMonth: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  activeUsers: number;
  systemHealth: SystemHealth;
  userGrowthData: GrowthData[];
  submissionTrends: TrendData[];
  propertyDistribution: PropertyDistribution[];
  revenueMetrics: RevenueMetrics;
}
