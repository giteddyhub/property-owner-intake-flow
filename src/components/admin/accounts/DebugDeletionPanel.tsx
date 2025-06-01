
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEdgeFunctionTest } from '@/hooks/admin/useEdgeFunctionTest';
import { useUserDeletion } from '@/hooks/admin/useUserDeletion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Activity, Database, Shield, Server } from 'lucide-react';

export const DebugDeletionPanel: React.FC = () => {
  const { testAdminDeleteFunction, loading } = useEdgeFunctionTest();
  const { 
    testEdgeFunction, 
    testAdminSessionValidation,
    testDatabaseFunction,
    loading: functionLoading 
  } = useUserDeletion();
  
  const [testResult, setTestResult] = React.useState<{
    deployed: boolean;
    responding: boolean;
    message: string;
  } | null>(null);
  const [healthResult, setHealthResult] = React.useState<boolean | null>(null);
  const [sessionResult, setSessionResult] = React.useState<boolean | null>(null);
  const [dbResult, setDbResult] = React.useState<boolean | null>(null);

  const handleTest = async () => {
    const result = await testAdminDeleteFunction();
    setTestResult(result);
  };

  const handleHealthCheck = async () => {
    const result = await testEdgeFunction();
    setHealthResult(result);
  };

  const handleSessionTest = async () => {
    const result = await testAdminSessionValidation();
    setSessionResult(result);
  };

  const handleDatabaseTest = async () => {
    const result = await testDatabaseFunction();
    setDbResult(result);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button 
            onClick={handleTest} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Server className="h-4 w-4" />
            {loading ? 'Testing...' : 'Test Deployment'}
          </Button>
          
          <Button 
            onClick={handleHealthCheck} 
            disabled={functionLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {functionLoading ? 'Checking...' : 'Health Check'}
          </Button>

          <Button 
            onClick={handleSessionTest} 
            disabled={functionLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {functionLoading ? 'Testing...' : 'Test Session'}
          </Button>

          <Button 
            onClick={handleDatabaseTest} 
            disabled={functionLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {functionLoading ? 'Testing...' : 'Test Database'}
          </Button>
        </div>
        
        <div className="space-y-3">
          {healthResult !== null && (
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
          )}

          {sessionResult !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Session Status:</span>
              <Badge 
                variant={sessionResult ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {sessionResult ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {sessionResult ? 'Valid' : 'Invalid'}
              </Badge>
            </div>
          )}

          {dbResult !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Database Status:</span>
              <Badge 
                variant={dbResult ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {dbResult ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {dbResult ? 'Responsive' : 'Issues'}
              </Badge>
            </div>
          )}
          
          {testResult && (
            <>
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
