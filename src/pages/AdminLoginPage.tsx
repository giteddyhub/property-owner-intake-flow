
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLoginForm } from '@/components/admin/auth/AdminLoginForm';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { AdminClearSessionButton } from '@/components/admin/auth/AdminClearSessionButton';
import { AdminSessionDebugger } from '@/components/admin/auth/AdminSessionDebugger';

const AdminLoginPage: React.FC = () => {
  const { user } = useAuth();
  const { admin, isAdminAuthenticated, isAdminLoading, resetVerification } = useAdminAuth();
  const navigate = useNavigate();
  const [showDebugger, setShowDebugger] = React.useState(false);

  // Reset verification state when accessing login page
  React.useEffect(() => {
    resetVerification();
  }, [resetVerification]);

  // Check if admin is already logged in
  React.useEffect(() => {
    if (!isAdminLoading && isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, isAdminLoading, navigate]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Checking authentication status...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2" 
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
          <CardTitle className="text-2xl">Administrator Access</CardTitle>
          <CardDescription>Sign in with your administrator credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-muted-foreground text-center w-full mb-4">
            This area is restricted to authorized administrators only.
          </p>
          <div className="text-center w-full space-y-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem('admin_session');
                resetVerification();
                window.location.reload();
              }}
            >
              Having trouble? Reset Session
            </Button>
            
            <div>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => setShowDebugger(!showDebugger)}
              >
                {showDebugger ? 'Hide Diagnostics' : 'Show Diagnostics'}
              </Button>
            </div>
          </div>
          
          {showDebugger && <AdminSessionDebugger />}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
