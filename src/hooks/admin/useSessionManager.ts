
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export interface AdminSession {
  id: string;
  admin_id: string;
  admin_email: string;
  token: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  last_activity: string;
  is_current: boolean;
  is_expired: boolean;
}

export const useSessionManager = () => {
  const { admin, adminSession } = useAdminAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSessions = useCallback(async () => {
    if (!admin || !adminSession) return;

    setLoading(true);
    setError(null);

    try {
      // Mock implementation - in production would query admin_sessions table
      const mockSessions: AdminSession[] = [
        {
          id: '1',
          admin_id: admin.id,
          admin_email: admin.email,
          token: adminSession.token,
          ip_address: '192.168.1.1',
          user_agent: navigator.userAgent,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          expires_at: adminSession.expires_at,
          last_activity: new Date().toISOString(),
          is_current: true,
          is_expired: false
        },
        {
          id: '2',
          admin_id: admin.id,
          admin_email: admin.email,
          token: 'expired-token-123',
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0 (Mobile)',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() - 3600000).toISOString(),
          last_activity: new Date(Date.now() - 7200000).toISOString(),
          is_current: false,
          is_expired: true
        }
      ];

      setSessions(mockSessions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [admin, adminSession]);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      // In production, would call edge function to invalidate session
      await supabase.functions.invoke('admin-logout', {
        body: { session_id: sessionId }
      });

      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      return true;
    } catch (error) {
      console.error('Failed to revoke session:', error);
      return false;
    }
  }, []);

  const revokeAllOtherSessions = useCallback(async () => {
    if (!adminSession) return false;

    try {
      const otherSessions = sessions.filter(session => !session.is_current);
      
      for (const session of otherSessions) {
        await revokeSession(session.id);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
      return false;
    }
  }, [sessions, adminSession, revokeSession]);

  const getSessionInfo = useCallback((sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  }, [sessions]);

  const getActiveSessionsCount = useCallback(() => {
    return sessions.filter(session => !session.is_expired).length;
  }, [sessions]);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  return {
    sessions,
    loading,
    error,
    fetchActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    getSessionInfo,
    getActiveSessionsCount
  };
};
