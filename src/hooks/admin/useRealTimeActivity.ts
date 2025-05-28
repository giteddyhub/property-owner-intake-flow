
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEvent {
  id: string;
  type: 'user_signup' | 'user_login' | 'submission_created' | 'property_added' | 'admin_action';
  user_id?: string;
  user_email?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export const useRealTimeActivity = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const addActivity = (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEvent = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Mock real-time activity data
      const mockActivities: ActivityEvent[] = [
        {
          id: '1',
          type: 'user_signup',
          user_email: 'newuser@example.com',
          description: 'New user registration completed',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'low'
        },
        {
          id: '2',
          type: 'submission_created',
          user_email: 'user@example.com',
          description: 'Tax submission form completed',
          metadata: { properties: 2, owners: 1 },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          severity: 'medium'
        },
        {
          id: '3',
          type: 'admin_action',
          user_email: 'admin@example.com',
          description: 'User account suspended',
          metadata: { target_user: 'problematic@example.com', reason: 'policy_violation' },
          timestamp: new Date(Date.now() - 900000).toISOString(),
          severity: 'high'
        }
      ];
      
      setActivities(mockActivities);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new activity every 10 seconds
        const mockActivity = {
          type: 'user_login' as const,
          user_email: `user${Math.floor(Math.random() * 100)}@example.com`,
          description: 'User logged in',
          severity: 'low' as const
        };
        addActivity(mockActivity);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    activities,
    loading,
    isConnected,
    addActivity,
    fetchRecentActivity
  };
};
