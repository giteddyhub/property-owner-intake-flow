
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSetupForm } from '@/components/admin/auth/AdminSetupForm';
import { AdminLoginForm } from '@/components/admin/auth/AdminLoginForm';
import { checkAdminSetupStatus, refreshAdminSetupStatus } from '@/components/admin/auth/adminAuthUtils';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

const AdminLoginPage: React.FC = () => {
  const { user } = useAuth();
  const { admin, isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [initialEmail, setInitialEmail] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if admin setup has been completed
  useEffect(() => {
    const checkSetup = async () => {
      setIsChecking(true);
      try {
        console.log("[AdminLoginPage] Checking admin setup status on page load...");
        
        // Check if we have a cached result
        const cachedStatus = sessionStorage.getItem('adminSetupComplete');
        const cachedTime = parseInt(sessionStorage.getItem('adminSetupCheckedAt') || '0');
        const cacheValid = Date.now() - cachedTime < 5 * 60 * 1000; // 5 minutes cache validity
        
        if (cachedStatus && cacheValid) {
          console.log("[AdminLoginPage] Using cached admin status:", cachedStatus);
          setIsSetupComplete(cachedStatus === 'true');
          setIsChecking(false);
          return;
        }
        
        // No valid cache, check fresh status
        const setupComplete = await checkAdminSetupStatus();
        console.log("[AdminLoginPage] Admin setup status result:", setupComplete ? "complete" : "incomplete");
        setIsSetupComplete(setupComplete);
      } catch (error) {
        console.error("[AdminLoginPage] Error checking admin setup:", error);
        // Default to showing login form if there's an error
        setIsSetupComplete(true);
        toast.error("Error checking admin setup", { 
          description: "Defaulting to login form. Use refresh if needed." 
        });
      } finally {
        setIsChecking(false);
      }
    };
    
    checkSetup();
  }, []);

  // Check if admin is already logged in
  useEffect(() => {
    if (!isAdminLoading && isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, isAdminLoading, navigate]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleSetupComplete = (email: string) => {
    console.log("[AdminLoginPage] Setup completed, showing login form with email:", email);
    setIsSetupComplete(true);
    setInitialEmail(email);
    
    // Update cache
    try {
      sessionStorage.setItem('adminSetupComplete', 'true');
      sessionStorage.setItem('adminSetupCheckedAt', Date.now().toString());
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      console.log("[AdminLoginPage] Manually refreshing admin setup status...");
      const setupComplete = await refreshAdminSetupStatus();
      console.log("[AdminLoginPage] Refreshed admin status:", setupComplete ? "complete" : "incomplete");
      setIsSetupComplete(setupComplete);
      
      toast.success("Status refreshed", {
        description: setupComplete 
          ? "Admin account exists. Showing login form." 
          : "No admin accounts found. Showing setup form."
      });
    } catch (error) {
      console.error("[AdminLoginPage] Error refreshing admin setup:", error);
      toast.error("Error refreshing status");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isChecking || isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Checking admin setup status...</p>
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
            
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
          <CardTitle className="text-2xl">
            {isSetupComplete === false ? 'Initial Admin Setup' : 'Administrator Access'}
          </CardTitle>
          <CardDescription>
            {isSetupComplete === false
              ? 'Create the first administrator account for Italian Taxes'
              : 'Sign in with your administrator credentials'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSetupComplete === false ? (
            <AdminSetupForm 
              onBackToLogin={handleBackToLogin} 
              onSetupComplete={handleSetupComplete}
            />
          ) : (
            <AdminLoginForm initialEmail={initialEmail} />
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            {isSetupComplete === false
              ? 'This setup will create a secure administrator account for Italian Taxes.'
              : 'This area is restricted to authorized administrators only.'
            }
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
