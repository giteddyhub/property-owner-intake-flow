
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export interface SecurityEvent {
  id: string;
  admin_id: string;
  admin_email: string;
  event_type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'failed_login' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const useSecurityLogger = () => {
  const { admin } = useAdminAuth();
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const logSecurityEvent = useCallback(async (
    eventType: SecurityEvent['event_type'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!admin) return;

    try {
      const event: SecurityEvent = {
        id: crypto.randomUUID(),
        admin_id: admin.id,
        admin_email: admin.email,
        event_type: eventType,
        severity,
        description,
        ip_address: 'unknown', // Would be captured server-side in production
        user_agent: navigator.userAgent,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      };

      // In production, this would be stored in a secure audit table
      setLogs(prev => [event, ...prev.slice(0, 999)]); // Keep last 1000 events
      
      console.log('Security Event Logged:', event);
      
      // Alert on high/critical severity events
      if (severity === 'high' || severity === 'critical') {
        console.warn('High severity security event:', event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [admin]);

  const fetchSecurityLogs = useCallback(async (filters?: {
    severity?: SecurityEvent['severity'];
    eventType?: SecurityEvent['event_type'];
    adminId?: string;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      // Mock implementation - in production would query secure audit table
      const filteredLogs = logs.filter(log => {
        if (filters?.severity && log.severity !== filters.severity) return false;
        if (filters?.eventType && log.event_type !== filters.eventType) return false;
        if (filters?.adminId && log.admin_id !== filters.adminId) return false;
        return true;
      });

      const limitedLogs = filters?.limit 
        ? filteredLogs.slice(0, filters.limit)
        : filteredLogs;

      return limitedLogs;
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [logs]);

  return {
    logs,
    loading,
    logSecurityEvent,
    fetchSecurityLogs
  };
};
