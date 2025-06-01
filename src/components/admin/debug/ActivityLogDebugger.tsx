
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityLogger } from '@/services/activityLogger';
import { generateHistoricalActivities, generateAllHistoricalActivities } from '@/utils/generateHistoricalActivities';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Play, Trash, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const ActivityLogDebugger: React.FC = () => {
  const [failedLogs, setFailedLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activityCount, setActivityCount] = useState<number>(0);

  const refreshFailedLogs = () => {
    const failed = ActivityLogger.getFailedLogs();
    setFailedLogs(failed);
  };

  const clearFailedLogs = () => {
    ActivityLogger.clearFailedLogs();
    setFailedLogs([]);
    toast.success('Failed logs cleared');
  };

  const generateHistorical = async () => {
    setIsGenerating(true);
    try {
      await generateAllHistoricalActivities();
      toast.success('Historical activities generated successfully');
      await fetchActivityCount();
    } catch (error) {
      console.error('Error generating historical activities:', error);
      toast.error('Failed to generate historical activities');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchActivityCount = async () => {
    try {
      const { count } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true });
      
      setActivityCount(count || 0);
    } catch (error) {
      console.error('Error fetching activity count:', error);
    }
  };

  const testLogging = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      await ActivityLogger.log({
        userId: user.id,
        activityType: 'debug_test',
        activityDescription: 'Testing activity logging system',
        entityType: 'debug',
        metadata: {
          test_timestamp: new Date().toISOString(),
          source: 'debug_component'
        }
      });
      
      toast.success('Test activity logged');
      await fetchActivityCount();
    } catch (error) {
      console.error('Error testing logging:', error);
      toast.error('Test logging failed');
    }
  };

  useEffect(() => {
    refreshFailedLogs();
    fetchActivityCount();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Activity Logging Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Total Activities</span>
              <Badge variant="outline">{activityCount}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">Failed Logs</span>
              <Badge variant="destructive">{failedLogs.length}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testLogging} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Test Logging
            </Button>
            <Button onClick={refreshFailedLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Failed
            </Button>
            <Button onClick={clearFailedLogs} variant="outline" size="sm">
              <Trash className="h-4 w-4 mr-1" />
              Clear Failed
            </Button>
            <Button 
              onClick={generateHistorical} 
              variant="outline" 
              size="sm"
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Historical
            </Button>
          </div>

          {failedLogs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Failed Logs:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {failedLogs.map((log, index) => (
                  <div key={index} className="text-xs p-2 bg-red-50 rounded border">
                    <div className="font-medium">{log.activityType}</div>
                    <div className="text-gray-600">{log.activityDescription}</div>
                    <div className="text-gray-500">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
