
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

export const useAuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { adminSession } = useAdminAuth();

  const fetchAuditLogs = async (limit = 100) => {
    if (!adminSession?.token) {
      setError('No admin session available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('admin-tools', {
        body: { 
          action: 'fetch_audit_logs',
          limit
        },
        headers: {
          'x-admin-token': adminSession.token
        }
      });

      if (functionError) {
        throw new Error(`Failed to fetch audit logs: ${functionError.message}`);
      }

      setLogs(data?.logs || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      setError(error.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.token) {
      fetchAuditLogs();
    }
  }, [adminSession]);

  return {
    logs,
    loading,
    error,
    refetch: fetchAuditLogs
  };
};
