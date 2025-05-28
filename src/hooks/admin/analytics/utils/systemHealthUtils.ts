
import { supabase } from '@/integrations/supabase/client';

export interface SystemHealth {
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: string;
}

export const checkSystemHealth = async (): Promise<SystemHealth> => {
  const startTime = Date.now();
  
  try {
    // Simple health check query
    await supabase.from('profiles').select('id').limit(1);
    const responseTime = Date.now() - startTime;
    
    return {
      databaseStatus: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'error',
      apiResponseTime: responseTime,
      errorRate: 0.1, // Mock error rate
      uptime: 99.9, // Mock uptime
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      databaseStatus: 'error',
      apiResponseTime: Date.now() - startTime,
      errorRate: 5.0,
      uptime: 95.0,
      lastChecked: new Date().toISOString()
    };
  }
};
