
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertTriangle, LockIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const AdminLoginPage: React.FC = () => {
  const { user, loading, isAdmin, signIn, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Check if admin setup has been completed
  useEffect(() => {
    const checkAdminSetup = async () => {
      try {
        // Check if any admin users exist in the system
        const { data, error, count } = await supabase
          .from('admin_users')
          .select('*', { count: 'exact' });
        
        if (error) {
          console.error("Error checking admin setup:", error);
          return;
        }
        
        // If no admin users, setup hasn't been completed
        setIsSetupComplete(count !== null && count > 0);
      } catch (err) {
        console.error("Exception checking admin setup:", err);
      }
    };
    
    checkAdminSetup();
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

  const handleSetupAdmin = async () => {
    setIsSettingUp(true);
    setAuthError('');
    
    try {
      // The hardcoded default admin email
      const adminEmail = "edwin@italiantaxes.com";
      // Generate a secure password
      const generatedPassword = generateSecurePassword();
      
      // Create the admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: "Edwin Carrington" }
      });
      
      if (authError) {
        setAuthError(`Admin account creation failed: ${authError.message}`);
        setIsSettingUp(false);
        return;
      }
      
      if (!authData.user) {
        setAuthError('Admin account creation failed: No user returned');
        setIsSettingUp(false);
        return;
      }
      
      // Add the user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{ 
          id: authData.user.id,
          is_super_admin: true
        }]);
        
      if (adminError) {
        setAuthError(`Failed to grant admin privileges: ${adminError.message}`);
        setIsSettingUp(false);
        return;
      }
      
      // Show the generated password to the administrator
      toast.success('Admin account created successfully!', {
        duration: 10000,
      });
      
      // Display the credentials with a longer timeout
      toast(
        <div className="space-y-2">
          <div className="font-bold">Admin Credentials (Copy these now!)</div>
          <div><strong>Email:</strong> {adminEmail}</div>
          <div><strong>Password:</strong> {generatedPassword}</div>
          <div className="text-xs text-red-500 mt-2">
            This information will not be shown again!
          </div>
        </div>,
        {
          duration: 30000, // Show for 30 seconds
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        }
      );
      
      // Update the UI to show the login form
      setIsSetupComplete(true);
      setEmail(adminEmail);
      
    } catch (error: any) {
      setAuthError(`Setup failed: ${error.message}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sign in user
      const { error } = await signIn(email, password);
      
      if (error) {
        setAuthError(error.message);
        return;
      }
      
      // Check if the user is an admin
      const isUserAdmin = await checkAdminStatus();
      
      if (!isUserAdmin) {
        setAuthError('This account does not have administrative privileges');
        return;
      }
      
      toast.success('Signed in as administrator');
      navigate('/admin');
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred during sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Generate a secure random password
  const generateSecurePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {!isSetupComplete ? (
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
            <CardTitle className="text-2xl">Initial Admin Setup</CardTitle>
            <CardDescription>
              Create the first administrator account for Italian Taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700">Initial Setup Required</AlertTitle>
              <AlertDescription className="text-amber-700">
                No administrator accounts exist yet. Click the button below to create
                the initial admin account for edwin@italiantaxes.com.
              </AlertDescription>
            </Alert>

            {authError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Setup Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleSetupAdmin}
              className="w-full"
              disabled={isSettingUp}
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up admin account...
                </>
              ) : (
                <>
                  <LockIcon className="mr-2 h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              This setup will create a secure administrator account for Italian Taxes.
            </p>
          </CardFooter>
        </Card>
      ) : (
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
            <CardDescription>
              Sign in with your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in as Administrator'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              This area is restricted to authorized administrators only.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AdminLoginPage;
