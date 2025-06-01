
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEdgeFunctionTest } from '@/hooks/admin/useEdgeFunctionTest';
import { useUserDeletion } from '@/hooks/admin/useUserDeletion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

export const DebugDeletionPanel: React.FC = () => {
  const { testAdminDeleteFunction, loading } = useEdgeFunctionTest();
  const { testEdgeFunction, loading: healthLoading } = useUserDeletion();
  const [testResult, setTestResult] = React.useState<{
    deployed: boolean;
    responding: boolean;
    message: string;
  } | null>(null);
  const [healthResult, setHealthResult] = React.useState<boolean | null>(null);

  const handleTest = async () => {
    const result = await testAdminDeleteFunction();
    setTestResult(result);
  };

  const handleHealthCheck = async () => {
    const result = await testEdgeFunction();
    setHealthResult(result);
  };

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Debug: User Deletion Function
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleTest} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Testing...' : 'Test Edge Function'}
          </Button>
          
          <Button 
            onClick={handleHealthCheck} 
            disabled={healthLoading}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {healthLoading ? 'Checking...' : 'Health Check'}
          </Button>
        </div>
        
        {healthResult !== null && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Health Status:</span>
              <Badge 
                variant={healthResult ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {healthResult ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {healthResult ? 'Healthy' : 'Unhealthy'}
              </Badge>
            </div>
          </div>
        )}
        
        {testResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Deployment Status:</span>
              <Badge 
                variant={testResult.deployed ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {testResult.deployed ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {testResult.deployed ? 'Deployed' : 'Not Deployed'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Function Status:</span>
              <Badge 
                variant={testResult.responding ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {testResult.responding ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {testResult.responding ? 'Responding' : 'Issues'}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Message:</strong> {testResult.message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
