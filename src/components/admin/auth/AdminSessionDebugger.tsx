
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export const AdminSessionDebugger: React.FC = () => {
  const { admin, adminSession, checkAdminSession } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const runDiagnostic = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('Running admin session diagnostic');
      
      // Step 1: Output local session information
      const localInfo = {
        hasAdminObject: !!admin,
        adminId: admin?.id,
        adminEmail: admin?.email,
        hasSessionObject: !!adminSession,
        sessionToken: adminSession?.token ? `${adminSession.token.substring(0, 8)}...` : null,
        sessionExpiry: adminSession?.expires_at,
      };
      
      // Step 2: Verify token using edge function
      let serverValidation = null;
      if (adminSession?.token) {
        try {
          const { data, error } = await supabase.functions.invoke('admin-tools', {
            body: { 
              action: 'validate_admin_session', 
              params: { token: adminSession.token } 
            }
          });
          
          if (error) throw error;
          serverValidation = data;
        } catch (error) {
          console.error('Error validating token:', error);
          serverValidation = { error: error.message || 'Unknown error' };
        }
      }
      
      // Step 3: Run token refresh/validation
      let refreshResult = false;
      try {
        refreshResult = await checkAdminSession();
      } catch (error) {
        console.error('Error during session check:', error);
      }
      
      // Compile results
      setResults({
        timestamp: new Date().toISOString(),
        localInfo,
        serverValidation,
        refreshResult
      });
      
      toast.success('Session diagnostic complete');
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('Diagnostic failed', { 
        description: error.message || 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearSession = () => {
    localStorage.removeItem('admin_session');
    toast.info('Admin session data cleared', {
      description: 'Page will reload in 2 seconds'
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Admin Session Diagnostic
        </CardTitle>
        <CardDescription>
          Check your current admin session status and validate the authentication token
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {results ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Local Session Data:</h3>
              <ul className="text-sm space-y-1">
                <li>Admin Object: {results.localInfo.hasAdminObject ? '✅' : '❌'}</li>
                <li>Admin Email: {results.localInfo.adminEmail || 'Not available'}</li>
                <li>Session Object: {results.localInfo.hasSessionObject ? '✅' : '❌'}</li>
                <li>Token Exists: {results.localInfo.sessionToken ? '✅' : '❌'}</li>
                {results.localInfo.sessionExpiry && (
                  <li>Expires: {new Date(results.localInfo.sessionExpiry).toLocaleString()}</li>
                )}
              </ul>
            </div>
            
            {results.serverValidation && (
              <div className="p-3 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Server Validation:</h3>
                {results.serverValidation.error ? (
                  <div className="text-red-500 text-sm">
                    Error: {results.serverValidation.error}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>Token Valid:</span>
                      {results.serverValidation.valid ? (
                        <span className="text-green-500 flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-1" /> Valid
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <ShieldAlert className="h-4 w-4 mr-1" /> Invalid
                        </span>
                      )}
                    </div>
                    
                    {results.serverValidation.session && (
                      <div className="text-sm">
                        <p>Created: {new Date(results.serverValidation.session.created_at).toLocaleString()}</p>
                        <p>Expires: {new Date(results.serverValidation.session.expires_at).toLocaleString()}</p>
                        <p>Status: {results.serverValidation.session.is_expired ? 'Expired' : 'Active'}</p>
                        {!results.serverValidation.session.is_expired && (
                          <p>Remaining: {results.serverValidation.session.time_remaining}</p>
                        )}
                      </div>
                    )}
                    
                    {results.serverValidation.admin && (
                      <div className="text-sm mt-2">
                        <p>Admin Email: {results.serverValidation.admin.email}</p>
                        <p>Admin Name: {results.serverValidation.admin.full_name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-3 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Session Refresh:</h3>
              <div className="flex items-center">
                <span>Result:</span>
                {results.refreshResult ? (
                  <span className="ml-2 text-green-500 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Success
                  </span>
                ) : (
                  <span className="ml-2 text-red-500 flex items-center">
                    <ShieldAlert className="h-4 w-4 mr-1" /> Failed
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Click the button below to run diagnostic checks on your admin session
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={runDiagnostic} 
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Diagnostic
            </>
          )}
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={clearSession}
          disabled={loading}
        >
          Clear Session Data
        </Button>
      </CardFooter>
    </Card>
  );
};
