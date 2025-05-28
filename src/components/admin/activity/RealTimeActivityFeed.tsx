
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealTimeActivity, ActivityEvent } from '@/hooks/admin/useRealTimeActivity';
import { 
  Users, 
  LogIn, 
  FileText, 
  Home, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const ActivityIcon: React.FC<{ type: ActivityEvent['type'] }> = ({ type }) => {
  switch (type) {
    case 'user_signup':
      return <Users className="h-4 w-4 text-blue-600" />;
    case 'user_login':
      return <LogIn className="h-4 w-4 text-green-600" />;
    case 'submission_created':
      return <FileText className="h-4 w-4 text-purple-600" />;
    case 'property_added':
      return <Home className="h-4 w-4 text-orange-600" />;
    case 'admin_action':
      return <Shield className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const SeverityIcon: React.FC<{ severity: ActivityEvent['severity'] }> = ({ severity }) => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    case 'medium':
      return <Info className="h-3 w-3 text-yellow-500" />;
    case 'low':
      return <CheckCircle className="h-3 w-3 text-green-500" />;
  }
};

const SeverityBadge: React.FC<{ severity: ActivityEvent['severity'] }> = ({ severity }) => {
  const variants = {
    high: 'destructive' as const,
    medium: 'secondary' as const,
    low: 'outline' as const
  };
  
  return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
};

export const RealTimeActivityFeed: React.FC = () => {
  const { activities, loading, isConnected } = useRealTimeActivity();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-time Activity</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.user_email && (
                        <p className="text-xs text-muted-foreground">{activity.user_email}</p>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-1">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <span key={key} className="inline-block text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <SeverityIcon severity={activity.severity} />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
