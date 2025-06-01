
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react';

interface SystemHealth {
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: string;
}

interface SystemHealthMonitorProps {
  systemHealth: SystemHealth;
  onRefresh: () => void;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  systemHealth,
  onRefresh
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Generate alerts based on system health
    const newAlerts: Alert[] = [];

    if (systemHealth.databaseStatus === 'error') {
      newAlerts.push({
        id: 'db-error',
        type: 'error',
        message: 'Database connection issues detected',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (systemHealth.databaseStatus === 'warning') {
      newAlerts.push({
        id: 'db-warning',
        type: 'warning',
        message: 'Database response time is slower than normal',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    if (systemHealth.errorRate > 2) {
      newAlerts.push({
        id: 'error-rate',
        type: 'error',
        message: `High error rate detected: ${systemHealth.errorRate}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (systemHealth.errorRate > 1) {
      newAlerts.push({
        id: 'error-rate-warning',
        type: 'warning',
        message: `Elevated error rate: ${systemHealth.errorRate}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    if (systemHealth.uptime < 99) {
      newAlerts.push({
        id: 'uptime-warning',
        type: 'warning',
        message: `System uptime below threshold: ${systemHealth.uptime}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    setAlerts(newAlerts);
  }, [systemHealth]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-green-600';
    if (uptime >= 99) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health Overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Status */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Database</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemHealth.databaseStatus)}
                {getStatusBadge(systemHealth.databaseStatus)}
              </div>
            </div>

            {/* API Response Time */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Response Time</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{systemHealth.apiResponseTime}ms</div>
                <div className="text-xs text-muted-foreground">
                  {systemHealth.apiResponseTime < 500 ? 'Excellent' : 
                   systemHealth.apiResponseTime < 1000 ? 'Good' : 
                   systemHealth.apiResponseTime < 2000 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error Rate</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${systemHealth.errorRate > 2 ? 'text-red-600' : systemHealth.errorRate > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {systemHealth.errorRate}%
                </div>
                <div className="text-xs text-muted-foreground">Last 24h</div>
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Uptime</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getUptimeColor(systemHealth.uptime)}`}>
                  {systemHealth.uptime}%
                </div>
                <div className="text-xs text-muted-foreground">30 days</div>
              </div>
            </div>
          </div>

          {/* Uptime Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">System Uptime</span>
              <span className="text-sm text-muted-foreground">{systemHealth.uptime}%</span>
            </div>
            <Progress 
              value={systemHealth.uptime} 
              className="h-2"
            />
          </div>

          {/* Last Checked */}
          <div className="text-xs text-muted-foreground">
            Last checked: {new Date(systemHealth.lastChecked).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p>{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}>
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
