
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecurityLogger, SecurityEvent } from '@/hooks/admin/useSecurityLogger';
import { Shield, AlertTriangle, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

export const SecurityMonitor: React.FC = () => {
  const { logs, fetchSecurityLogs } = useSecurityLogger();
  const [selectedSeverity, setSelectedSeverity] = useState<SecurityEvent['severity'] | 'all'>('all');
  const [selectedEventType, setSelectedEventType] = useState<SecurityEvent['event_type'] | 'all'>('all');

  const filteredLogs = logs.filter(log => {
    if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;
    if (selectedEventType !== 'all' && log.event_type !== selectedEventType) return false;
    return true;
  });

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventTypeIcon = (eventType: SecurityEvent['event_type']) => {
    switch (eventType) {
      case 'login':
      case 'logout':
        return <Shield className="h-4 w-4" />;
      case 'failed_login':
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Admin', 'Event Type', 'Severity', 'Description', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.admin_email,
        log.event_type,
        log.severity,
        log.description,
        log.ip_address || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedEventType} onValueChange={(value: any) => setSelectedEventType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="failed_login">Failed Login</SelectItem>
              <SelectItem value="permission_change">Permission Change</SelectItem>
              <SelectItem value="data_access">Data Access</SelectItem>
              <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No security events found</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(log.event_type)}
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{log.event_type.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{log.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Admin: {log.admin_email} | IP: {log.ip_address || 'Unknown'}
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
