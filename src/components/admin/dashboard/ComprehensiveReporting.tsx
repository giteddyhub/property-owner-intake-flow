import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Users, 
  FileText, 
  Home,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import { OptimizedAnalytics } from '@/hooks/admin/types/optimizedAnalyticsTypes';

interface ComprehensiveReportingProps {
  analytics: OptimizedAnalytics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ComprehensiveReporting: React.FC<ComprehensiveReportingProps> = ({ analytics }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  const exportReport = (type: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
    // In a real implementation, this would trigger a download
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate trends
  const userGrowthTrend = analytics.userGrowthData.length > 1 
    ? getGrowthPercentage(
        analytics.userGrowthData[analytics.userGrowthData.length - 1].users,
        analytics.userGrowthData[analytics.userGrowthData.length - 7]?.users || 0
      ) 
    : 0;

  const sessionTrend = analytics.sessionTrends.length > 1
    ? getGrowthPercentage(
        analytics.sessionTrends[analytics.sessionTrends.length - 1].total,
        analytics.sessionTrends[analytics.sessionTrends.length - 2].total
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comprehensive Analytics Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.totalUsers}</div>
                <div className="text-sm text-blue-600/70">Total Users</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">+{userGrowthTrend}% this week</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.totalSubmissions}</div>
                <div className="text-sm text-green-600/70">Total Sessions</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">+{sessionTrend}% this month</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Home className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{analytics.totalProperties}</div>
                <div className="text-sm text-purple-600/70">Total Properties</div>
                <div className="text-xs text-purple-600/70 mt-1">Active listings</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  €{analytics.revenueMetrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-orange-600/70">Total Revenue</div>
                <div className="text-xs text-orange-600/70 mt-1">
                  €{analytics.revenueMetrics.monthlyRevenue.toLocaleString()} this month
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Growth Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer>
                  <ComposedChart data={analytics.userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="#8884d8" name="New Users" />
                    <Line type="monotone" dataKey="sessions" stroke="#82ca9d" name="Sessions" strokeWidth={2} />
                    <Line type="monotone" dataKey="properties" stroke="#ffc658" name="Properties" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Property Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.propertyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analytics.propertyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {analytics.propertyDistribution.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.count} ({item.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Status Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <ChartContainer config={{}} className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.sessionTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="completed"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Completed"
                        />
                        <Area
                          type="monotone"
                          dataKey="pending"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name="Pending"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer>
                  <LineChart data={analytics.userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analytics.newUsersThisMonth}</div>
                <p className="text-sm text-muted-foreground">New Users This Month</p>
                <Badge variant="outline" className="mt-2">
                  {Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100)}% growth
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{analytics.activeUsers}</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <Badge variant="outline" className="mt-2">
                  {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round((analytics.completedSubmissions / analytics.totalSubmissions) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <Badge variant="outline" className="mt-2">
                  Above average
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Volume by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer>
                  <BarChart data={analytics.sessionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    <Bar dataKey="pending" fill="#8884d8" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{analytics.completedSubmissions}</div>
                <p className="text-sm text-muted-foreground">Completed Sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{analytics.pendingSubmissions}</div>
                <p className="text-sm text-muted-foreground">Pending Sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round((analytics.completedSubmissions / analytics.totalSubmissions) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">€{analytics.revenueMetrics.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">€{analytics.revenueMetrics.monthlyRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">€{Math.round(analytics.revenueMetrics.averageOrderValue)}</div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{(analytics.revenueMetrics.conversionRate).toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
