
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { InteractiveDashboardWidget } from '@/components/admin/dashboard/InteractiveDashboardWidget';
import { SystemHealthMonitor } from '@/components/admin/dashboard/SystemHealthMonitor';
import { ComprehensiveReporting } from '@/components/admin/dashboard/ComprehensiveReporting';
import { useRealTimeAnalytics } from '@/hooks/admin/useRealTimeAnalytics';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Database
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { analytics, loading, error, refetch } = useRealTimeAnalytics();

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
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <ActionsToolbar onRefresh={handleRefresh} />
        </div>

        {/* Real-time Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InteractiveDashboardWidget
            title="Total Users"
            value={analytics.totalUsers}
            change={{
              value: Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100),
              type: 'increase',
              period: 'this month'
            }}
            status="success"
            icon={<Users className="h-4 w-4" />}
            description={`${analytics.activeUsers} currently active`}
            drillDownData={analytics.userGrowthData}
            drillDownType="chart"
          />

          <InteractiveDashboardWidget
            title="Total Submissions"
            value={analytics.totalSubmissions}
            change={{
              value: Math.round((analytics.completedSubmissions / analytics.totalSubmissions) * 100),
              type: 'increase',
              period: 'completion rate'
            }}
            status={analytics.pendingSubmissions > analytics.completedSubmissions ? 'warning' : 'success'}
            icon={<FileText className="h-4 w-4" />}
            description={`${analytics.completedSubmissions} completed, ${analytics.pendingSubmissions} pending`}
            drillDownData={analytics.submissionTrends}
            drillDownType="chart"
          />

          <InteractiveDashboardWidget
            title="Total Properties"
            value={analytics.totalProperties}
            status="info"
            icon={<Home className="h-4 w-4" />}
            description="Registered properties"
            drillDownData={analytics.propertyDistribution}
            drillDownType="chart"
          />

          <InteractiveDashboardWidget
            title="Total Revenue"
            value={`€${analytics.revenueMetrics.totalRevenue.toLocaleString()}`}
            change={{
              value: 15,
              type: 'increase',
              period: 'this month'
            }}
            status="success"
            icon={<DollarSign className="h-4 w-4" />}
            description={`€${analytics.revenueMetrics.monthlyRevenue.toLocaleString()} this month`}
            drillDownData={[
              { name: 'Total Revenue', value: analytics.revenueMetrics.totalRevenue },
              { name: 'Monthly Revenue', value: analytics.revenueMetrics.monthlyRevenue },
              { name: 'Average Order', value: analytics.revenueMetrics.averageOrderValue }
            ]}
            drillDownType="table"
          />
        </div>

        {/* Main Dashboard Content */}
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
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          analytics.systemHealth.databaseStatus === 'healthy' ? 'bg-green-500' :
                          analytics.systemHealth.databaseStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm ${
                          analytics.systemHealth.databaseStatus === 'healthy' ? 'text-green-600' :
                          analytics.systemHealth.databaseStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analytics.systemHealth.databaseStatus === 'healthy' ? 'Healthy' :
                           analytics.systemHealth.databaseStatus === 'warning' ? 'Warning' : 'Error'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm text-muted-foreground">~{analytics.systemHealth.apiResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <span className="text-sm text-muted-foreground">{analytics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <span className={`text-sm ${analytics.systemHealth.errorRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                        {analytics.systemHealth.errorRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm text-green-600">{analytics.systemHealth.uptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Growth</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">
                          +{Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((analytics.completedSubmissions / analytics.totalSubmissions) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Order Value</span>
                      <span className="text-sm text-muted-foreground">
                        €{Math.round(analytics.revenueMetrics.averageOrderValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(analytics.revenueMetrics.conversionRate * 100).toFixed(1)}%
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

          <TabsContent value="reports">
            <ComprehensiveReporting analytics={analytics} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+{analytics.newUsersThisMonth}</div>
                  <p className="text-sm text-muted-foreground">New users this month</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100)}% increase
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{analytics.activeUsers}</div>
                  <p className="text-sm text-muted-foreground">Currently active</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total users
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((analytics.completedSubmissions / analytics.totalSubmissions) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Form completion rate</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {analytics.completedSubmissions} of {analytics.totalSubmissions} submissions
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
