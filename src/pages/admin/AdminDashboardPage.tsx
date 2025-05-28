
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminAnalyticsCards } from '@/components/admin/analytics/AdminAnalyticsCards';
import { RecentActivityFeed } from '@/components/admin/analytics/RecentActivityFeed';
import { RealTimeActivityFeed } from '@/components/admin/activity/RealTimeActivityFeed';
import { AuditLogViewer } from '@/components/admin/audit/AuditLogViewer';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, BarChart3, Users } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { analytics, loading, error, refetch } = useAdminAnalytics();

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
        <div className="text-center text-red-600 p-8">
          <p>Error loading dashboard: {error}</p>
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

        {/* Analytics Overview */}
        <AdminAnalyticsCards analytics={analytics} />

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Activity
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivityFeed activities={analytics.recentActivity} />
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm text-muted-foreground">~125ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <span className="text-sm text-muted-foreground">{analytics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <span className="text-sm text-green-600">0.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <RealTimeActivityFeed />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
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
