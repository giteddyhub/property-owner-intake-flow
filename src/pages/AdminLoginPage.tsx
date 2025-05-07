
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSetupForm } from '@/components/admin/auth/AdminSetupForm';
import { AdminLoginForm } from '@/components/admin/auth/AdminLoginForm';
import { checkAdminSetupStatus } from '@/components/admin/auth/adminAuthUtils';

const AdminLoginPage: React.FC = () => {
  const { user, loading, isAdmin, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [initialEmail, setInitialEmail] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  // Check if admin setup has been completed
  useEffect(() => {
    const checkSetup = async () => {
      setIsChecking(true);
      try {
        console.log("Checking admin setup status on page load...");
        const setupComplete = await checkAdminSetupStatus();
        console.log("Admin setup status result:", setupComplete ? "complete" : "incomplete");
        setIsSetupComplete(setupComplete);
      } catch (error) {
        console.error("Error checking admin setup:", error);
        // Default to showing login form if there's an error
        setIsSetupComplete(true);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkSetup();
  }, []);

  // Check if user is already logged in and is admin
  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        const isUserAdmin = await checkAdminStatus();
        if (isUserAdmin) {
          navigate('/admin');
        }
      }
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [user, loading, navigate, checkAdminStatus]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleSetupComplete = (email: string) => {
    setIsSetupComplete(true);
    setInitialEmail(email);
  };

  if (isChecking) {
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
