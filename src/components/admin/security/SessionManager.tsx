
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessionManager } from '@/hooks/admin/useSessionManager';
import { Monitor, Smartphone, LogOut, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const SessionManager: React.FC = () => {
  const { 
    sessions, 
    loading, 
    revokeSession, 
    revokeAllOtherSessions, 
    getActiveSessionsCount 
  } = useSessionManager();

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      toast.error('Cannot revoke current session');
      return;
    }

    const success = await revokeSession(sessionId);
    if (success) {
      toast.success('Session revoked successfully');
    } else {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllOthers = async () => {
    const success = await revokeAllOtherSessions();
    if (success) {
      toast.success('All other sessions revoked');
    } else {
      toast.error('Failed to revoke sessions');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getLocationFromIP = (ip: string) => {
    // Mock location detection - in production would use IP geolocation service
    const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions ({getActiveSessionsCount()})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRevokeAllOthers}
            disabled={loading || sessions.filter(s => !s.is_current).length === 0}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Revoke All Others
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getDeviceIcon(session.user_agent || '')}
                    <span className="font-medium">
                      {session.user_agent?.includes('Mobile') ? 'Mobile Device' : 'Desktop'}
                    </span>
                    {session.is_current && (
                      <Badge variant="default">Current Session</Badge>
                    )}
                    {session.is_expired && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <strong>IP Address:</strong> {session.ip_address || 'Unknown'}
                    </div>
                    <div>
                      <strong>Location:</strong> {getLocationFromIP(session.ip_address || '')}
                    </div>
                    <div>
                      <strong>Created:</strong> {format(new Date(session.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div>
                      <strong>Last Activity:</strong> {format(new Date(session.last_activity), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div>
                      <strong>Expires:</strong> {format(new Date(session.expires_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>

                  {session.is_expired && (
                    <div className="flex items-center gap-2 mt-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">This session has expired</span>
                    </div>
                  )}
                </div>

                {!session.is_current && !session.is_expired && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id, session.is_current)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No active sessions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
