
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
      
      // First check if there are any existing admin users
      const { count: adminCount, error: countError } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error checking admin users:", countError);
        setAuthError(`Setup failed: ${countError.message}`);
        setIsSettingUp(false);
        return;
      }

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
      
      // Sign in immediately after creation to establish auth context
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: generatedPassword
      });
      
      if (signInError) {
        console.error("Admin sign in error:", signInError);
        setAuthError(`Failed to sign in as admin: ${signInError.message}`);
        setIsSettingUp(false);
        return;
      }
      
      // Now that we're authenticated as the new user, insert into admin_users table
      // The RLS policy we set allows the first admin to be created when the table is empty
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{ 
          id: authData.user.id,
          is_super_admin: true
        }]);
        
      if (adminError) {
        console.error("Admin privilege error:", adminError);
        setAuthError(`Failed to grant admin privileges: ${adminError.message}`);
        
        // Sign out if admin privilege assignment failed
        await supabase.auth.signOut();
        
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
