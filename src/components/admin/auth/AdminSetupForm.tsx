
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LockIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateSecurePassword, refreshAdminSetupStatus } from './adminAuthUtils';
import { showAdminCredentialsToast } from './AdminCredentialsToast';

interface AdminSetupFormProps {
  onBackToLogin: () => void;
  onSetupComplete: (email: string) => void;
}

export const AdminSetupForm: React.FC<AdminSetupFormProps> = ({
  onBackToLogin,
  onSetupComplete
}) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Double-check on component mount if we should actually be showing this form
  useEffect(() => {
    const verifySetupNeeded = async () => {
      try {
        console.log("[AdminSetupForm] Verifying if setup is needed...");
        
        // First check direct database for admin users
        const { count, error } = await supabase
          .from('admin_credentials')
          .select('*', { count: 'exact', head: true });
          
        if (!error && count !== null && count > 0) {
          // Admin already exists, redirect to login form
          console.log("[AdminSetupForm] Admin already exists (count:", count, "), redirecting to login form");
          onSetupComplete(""); // Trigger parent to show login form
          return;
        }
        
        if (error) {
          console.error("[AdminSetupForm] Error checking admin existence:", error);
        }
        
        console.log("[AdminSetupForm] No admins found in initial check, setup form will be shown");
      } catch (err) {
        console.error("[AdminSetupForm] Exception in verification:", err);
      }
    };
    
    verifySetupNeeded();
  }, [onSetupComplete]);

  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    setAuthError('');
    
    try {
      const adminExists = await refreshAdminSetupStatus();
      console.log("[AdminSetupForm] Refresh status check result:", adminExists);
      
      if (adminExists) {
        toast.info("Admin account already exists", {
          description: "Redirecting you to the login form"
        });
        onSetupComplete("");
      } else {
        toast.info("No admin accounts found", {
          description: "You can create the initial admin account now"
        });
      }
    } catch (error: any) {
      console.error("[AdminSetupForm] Error refreshing status:", error);
      setAuthError(`Failed to refresh status: ${error.message}`);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleSetupAdmin = async () => {
    setIsSettingUp(true);
    setAuthError('');
    
    try {
      // The hardcoded default admin email
      const adminEmail = "edwin@italiantaxes.com";
      // Generate a secure password
      const generatedPassword = generateSecurePassword();
      
      // Create the admin user using the edge function
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: adminEmail,
          password: generatedPassword,
          full_name: "Edwin Carrington"
        }
      });
      
      if (error) {
        setAuthError(`Admin account creation failed: ${error.message}`);
        setIsSettingUp(false);
        return;
      }
      
      if (!data) {
        setAuthError('Admin account creation failed: No response data');
        setIsSettingUp(false);
        return;
      }
      
      // Display admin credentials using the extracted component
      showAdminCredentialsToast({
        email: adminEmail,
        password: generatedPassword
      });
      
      // Update the UI to show the login form
      onSetupComplete(adminEmail);
      
    } catch (error: any) {
      setAuthError(`Setup failed: ${error.message}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <>
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
      
      <div className="space-y-4">
        <Button
          onClick={handleSetupAdmin}
          className="w-full"
          disabled={isSettingUp || isRefreshingStatus}
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
        
        <Button
          onClick={handleRefreshStatus}
          variant="outline"
          className="w-full"
          disabled={isSettingUp || isRefreshingStatus}
        >
          {isRefreshingStatus ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking admin status...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Admin Status
            </>
          )}
        </Button>
      </div>
    </>
  );
};
