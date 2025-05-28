
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Calendar,
  Clock,
  FileText,
  Home
} from 'lucide-react';
import { UserWithMetrics } from '@/hooks/admin/useAdvancedFiltering';

interface UserEngagementAnalyticsProps {
  users: UserWithMetrics[];
}

export const UserEngagementAnalytics: React.FC<UserEngagementAnalyticsProps> = ({ users }) => {
  // Calculate engagement metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.account_status === 'active').length;
  const highActivityUsers = users.filter(u => u.login_frequency === 'high').length;
  const averageActivityScore = users.reduce((acc, u) => acc + u.activity_score, 0) / totalUsers || 0;
  
  const newUsersThisWeek = users.filter(u => {
    const userDate = new Date(u.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return userDate > weekAgo;
  }).length;

  const totalSubmissions = users.reduce((acc, u) => acc + u.submissions_count, 0);
  const totalProperties = users.reduce((acc, u) => acc + u.properties_count, 0);
  const completionRate = totalUsers > 0 ? (users.filter(u => u.submissions_count > 0).length / totalUsers) * 100 : 0;

  // Engagement distribution
  const engagementDistribution = {
    high: users.filter(u => u.login_frequency === 'high').length,
    medium: users.filter(u => u.login_frequency === 'medium').length,
    low: users.filter(u => u.login_frequency === 'low').length
  };

  // Top performing users
  const topUsers = users
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 5);

  // Recent activity trends (mock data)
  const activityTrend = Math.random() > 0.5 ? 'up' : 'down';
  const trendPercentage = Math.floor(Math.random() * 20) + 5;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{newUsersThisWeek} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={(activeUsers / totalUsers) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((activeUsers / totalUsers) * 100)}% of all users
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {users.filter(u => u.submissions_count > 0).length} users completed forms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Activity Score</p>
                <p className="text-2xl font-bold">{Math.round(averageActivityScore)}</p>
              </div>
              <div className="flex items-center">
                {activityTrend === 'up' ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {activityTrend === 'up' ? (
                <span className="text-green-600">+{trendPercentage}% from last month</span>
              ) : (
                <span className="text-red-600">-{trendPercentage}% from last month</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{engagementDistribution.high}</span>
                  <Badge variant="outline">{Math.round((engagementDistribution.high / totalUsers) * 100)}%</Badge>
                </div>
              </div>
              <Progress value={(engagementDistribution.high / totalUsers) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Medium Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{engagementDistribution.medium}</span>
                  <Badge variant="outline">{Math.round((engagementDistribution.medium / totalUsers) * 100)}%</Badge>
                </div>
              </div>
              <Progress value={(engagementDistribution.medium / totalUsers) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Low Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{engagementDistribution.low}</span>
                  <Badge variant="outline">{Math.round((engagementDistribution.low / totalUsers) * 100)}%</Badge>
                </div>
              </div>
              <Progress value={(engagementDistribution.low / totalUsers) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || user.email.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{user.activity_score}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{user.submissions_count}</span>
                      <Home className="h-3 w-3 ml-1" />
                      <span>{user.properties_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalProperties}</div>
              <div className="text-sm text-muted-foreground">Total Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{highActivityUsers}</div>
              <div className="text-sm text-muted-foreground">High Activity Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((totalSubmissions / totalUsers) * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">Avg Submissions/User</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
