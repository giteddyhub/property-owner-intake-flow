
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardWidget } from '@/components/admin/dashboard/widget/DashboardWidget';
import { SystemHealthMonitor } from '@/components/admin/dashboard/SystemHealthMonitor';
import { ComprehensiveReporting } from '@/components/admin/dashboard/ComprehensiveReporting';
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  BarChart3, 
  Users, 
  FileText, 
  Home,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Server,
  Database,
  Clock,
  Zap
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { analytics, loading, error, refetch } = useOptimizedAdminData();

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard: {error}
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="text-center text-muted-foreground p-8">
          <p>No analytics data available</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Optimized Performance
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {analytics.systemHealth.apiResponseTime}ms response
              </Badge>
            </div>
          </div>
          <ActionsToolbar onRefresh={handleRefresh} />
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.systemHealth.apiResponseTime}ms
                </div>
                <p className="text-sm text-muted-foreground">Query Response Time</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  analytics.systemHealth.databaseStatus === 'healthy' ? 'text-green-600' :
                  analytics.systemHealth.databaseStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analytics.systemHealth.databaseStatus === 'healthy' ? '✓' :
                   analytics.systemHealth.databaseStatus === 'warning' ? '⚠' : '✗'}
                </div>
                <p className="text-sm text-muted-foreground">Database Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.systemHealth.errorRate}%
                </div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.systemHealth.uptime}%
                </div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Widgets with Accurate Growth Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardWidget
            title="Total Users"
            value={analytics.totalUsers}
            change={{
              value: analytics.growthMetrics.userGrowthRate,
              type: analytics.growthMetrics.userGrowthRate >= 0 ? 'increase' : 'decrease',
              period: 'this month'
            }}
            status="success"
            icon={<Users className="h-4 w-4" />}
            description={`${analytics.activeUsers} active users`}
          />

          <DashboardWidget
            title="Form Submissions"
            value={analytics.totalSubmissions}
            change={{
              value: analytics.growthMetrics.submissionGrowthRate,
              type: analytics.growthMetrics.submissionGrowthRate >= 0 ? 'increase' : 'decrease',
              period: 'this month'
            }}
            status={analytics.pendingSubmissions > analytics.completedSubmissions ? 'warning' : 'success'}
            icon={<FileText className="h-4 w-4" />}
            description={`${analytics.completedSubmissions} completed`}
          />

          <DashboardWidget
            title="Properties"
            value={analytics.totalProperties}
            status="info"
            icon={<Home className="h-4 w-4" />}
            description="Total registered properties"
          />

          <DashboardWidget
            title="Revenue"
            value={`€${analytics.totalRevenue.toLocaleString()}`}
            change={{
              value: Math.abs(analytics.growthMetrics.revenueGrowthRate),
              type: analytics.growthMetrics.revenueGrowthRate >= 0 ? 'increase' : 'decrease',
              period: 'this month'
            }}
            status="success"
            icon={<DollarSign className="h-4 w-4" />}
            description={`€${analytics.monthlyRevenue.toLocaleString()} monthly`}
          />
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Growth Rate</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-3 w-3 ${analytics.growthMetrics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm ${analytics.growthMetrics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics.growthMetrics.userGrowthRate >= 0 ? '+' : ''}{analytics.growthMetrics.userGrowthRate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Growth Rate</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-3 w-3 ${analytics.growthMetrics.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm ${analytics.growthMetrics.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics.growthMetrics.revenueGrowthRate >= 0 ? '+' : ''}{analytics.growthMetrics.revenueGrowthRate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((analytics.completedSubmissions / Math.max(analytics.totalSubmissions, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((analytics.activeUsers / Math.max(analytics.totalUsers, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Month Revenue</span>
                      <span className="text-sm font-medium">
                        €{analytics.revenueMetrics.monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Previous Month Revenue</span>
                      <span className="text-sm text-muted-foreground">
                        €{analytics.revenueMetrics.previousMonthRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Order Value</span>
                      <span className="text-sm text-muted-foreground">
                        €{analytics.revenueMetrics.averageOrderValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.revenueMetrics.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthMonitor 
              systemHealth={analytics.systemHealth} 
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activities found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentActivities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {activity.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ComprehensiveReporting analytics={analytics} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
