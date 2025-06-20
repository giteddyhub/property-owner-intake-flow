
import { useEffect, useRef, useState } from 'react';

interface UseRealTimeDataProps {
  refetchFn: () => Promise<void>;
  intervalMs?: number;
  enabled?: boolean;
}

export const useRealTimeData = ({ 
  refetchFn, 
  intervalMs = 30000, // 30 seconds default
  enabled = true 
}: UseRealTimeDataProps) => {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAutoRefreshing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        await refetchFn();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRefreshing, intervalMs, refetchFn]);

  const toggleAutoRefresh = () => {
    setIsAutoRefreshing(prev => !prev);
  };

  return {
    isAutoRefreshing,
    toggleAutoRefresh
  };
};
