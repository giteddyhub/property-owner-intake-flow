
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLog, AuditLogEntry } from '@/hooks/admin/useAuditLog';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogViewer: React.FC = () => {
  const { logs, loading, fetchLogs } = useAuditLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_id && log.target_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || log.target_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('delete') || action.includes('suspend')) return 'destructive';
    if (action.includes('create') || action.includes('activate')) return 'default';
    if (action.includes('update') || action.includes('modify')) return 'secondary';
    return 'outline';
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'Details'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.admin_email,
        log.action,
        log.target_type,
        log.target_id || 'N/A',
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Log</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by action, admin, or target..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">User Actions</SelectItem>
              <SelectItem value="account">Account Actions</SelectItem>
              <SelectItem value="system">System Actions</SelectItem>
              <SelectItem value="submission">Submission Actions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No audit logs found</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {log.admin_email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm">
                      Target: <span className="font-medium">{log.target_type}</span>
                      {log.target_id && (
                        <span className="text-muted-foreground"> ({log.target_id})</span>
                      )}
                    </div>
                    {expandedLog === log.id && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <strong>IP Address:</strong> {log.ip_address || 'Unknown'}
                          </div>
                          <div>
                            <strong>User Agent:</strong> {log.user_agent?.substring(0, 50)}...
                          </div>
                        </div>
                        {Object.keys(log.details).length > 0 && (
                          <div className="mt-2">
                            <strong>Details:</strong>
                            <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
