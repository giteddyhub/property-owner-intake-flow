
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuditLogViewer } from '@/hooks/admin/useAuditLogViewer';
import { Shield, RefreshCw, Eye, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { logs, loading, error, refetch } = useAuditLogViewer();

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('logout')) {
      return <Shield className="h-4 w-4" />;
    }
    if (action.includes('error') || action.includes('failed')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('access') || action.includes('view')) {
      return <Eye className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('error') || action.includes('failed')) {
      return 'destructive';
    }
    if (action.includes('login') || action.includes('create')) {
      return 'default';
    }
    return 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load audit logs: {error}</p>
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Audit Log
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No audit log entries found
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  {log.target_type && (
                    <div>Target: {log.target_type} {log.target_id && `(${log.target_id.substring(0, 8)}...)`}</div>
                  )}
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Admin: {log.admin_email || 'Unknown'} | IP: {log.ip_address || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
