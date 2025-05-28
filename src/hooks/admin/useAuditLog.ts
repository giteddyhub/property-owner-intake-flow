
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: 'user' | 'account' | 'system' | 'submission';
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useAuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logAction = async (
    action: string,
    targetType: AuditLogEntry['target_type'],
    targetId?: string,
    details?: Record<string, any>
  ) => {
    try {
      // For now, store in local state - in production this would be stored in database
      const newLog: AuditLogEntry = {
        id: crypto.randomUUID(),
        admin_id: 'current-admin', // Would come from admin context
        admin_email: 'admin@example.com', // Would come from admin context
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || {},
        ip_address: 'unknown',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
      console.log('Audit log:', newLog);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const fetchLogs = async (limit = 50) => {
    setLoading(true);
    try {
      // Mock data for now - in production would fetch from database
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          admin_id: 'admin-1',
          admin_email: 'admin@example.com',
          action: 'user_status_changed',
          target_type: 'user',
          target_id: 'user-123',
          details: { from: 'active', to: 'suspended', reason: 'Policy violation' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          admin_id: 'admin-1',
          admin_email: 'admin@example.com',
          action: 'admin_login',
          target_type: 'system',
          details: { success: true, method: 'password' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      setLogs(mockLogs);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    logAction,
    fetchLogs
  };
};
