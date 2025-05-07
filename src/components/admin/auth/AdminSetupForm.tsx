
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LockIcon, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateSecurePassword } from './adminAuthUtils';
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

  const handleSetupAdmin = async () => {
    setIsSettingUp(true);
    setAuthError('');
    
    try {
      // The hardcoded default admin email
      const adminEmail = "edwin@italiantaxes.com";
      // Generate a secure password
      const generatedPassword = generateSecurePassword();
      
      // Create the admin user using the regular signup flow
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: generatedPassword,
        options: {
          data: { full_name: "Edwin Carrington" }
        }
      });
      
      if (signUpError) {
        setAuthError(`Admin account creation failed: ${signUpError.message}`);
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
    </>
  );
};
