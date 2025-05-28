
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityItem } from '@/hooks/admin/useAdminAnalytics';
import { Users, ClipboardList, Home, Shield, Clock } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'submission_completed':
        return <ClipboardList className="h-4 w-4 text-green-600" />;
      case 'property_added':
        return <Home className="h-4 w-4 text-purple-600" />;
      case 'admin_action':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_signup':
        return <Badge variant="secondary">New User</Badge>;
      case 'submission_completed':
        return <Badge variant="default">Completed</Badge>;
      case 'property_added':
        return <Badge variant="outline">Property</Badge>;
      case 'admin_action':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  {activity.user_email && (
                    <p className="text-xs text-muted-foreground">{activity.user_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getActivityBadge(activity.type)}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
