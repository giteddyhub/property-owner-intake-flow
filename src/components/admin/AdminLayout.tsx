
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { admin, isAdminLoading, isAdminAuthenticated, checkAdminSession, resetVerification, adminLogout } = useAdminAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only verify once when the component mounts
    const verifyAdmin = async () => {
      try {
        setIsVerifying(true);
        setVerificationFailed(false);
        
        // Only check if we're not already loading and not already authenticated
        if (!isAdminLoading && !isAdminAuthenticated) {
          const isValid = await checkAdminSession();
          
          if (!isValid) {
            console.log('Admin verification failed');
            setVerificationFailed(true);
          }
        }
      } catch (error) {
        console.error('Error during admin verification:', error);
        setVerificationFailed(true);
        toast.error('Authentication error', {
          description: 'Could not verify your administrator access'
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAdmin();
    // We intentionally don't include checkAdminSession in dependencies
    // to prevent infinite loops
  }, [isAdminLoading, isAdminAuthenticated]);
  
  const handleManualLogout = async () => {
    try {
      toast.info('Logging out...');
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during manual logout:', error);
      // Force logout by clearing local storage directly
      localStorage.removeItem('admin_session');
      resetVerification();
      window.location.href = '/admin/login';
    }
  };
  
  const handleRetryVerification = async () => {
    resetVerification(); // Reset verification attempts counter
    setIsVerifying(true);
    setVerificationFailed(false);
    
    try {
      const isValid = await checkAdminSession();
      if (!isValid) {
        setVerificationFailed(true);
        toast.error('Verification failed', {
          description: 'Could not verify your administrator credentials'
        });
      }
    } catch (error) {
      console.error('Error during verification retry:', error);
      setVerificationFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (isAdminLoading || isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <span className="text-lg font-medium">Verifying administrator access...</span>
        <p className="text-sm text-muted-foreground mt-2 mb-6">This may take a moment</p>
      </div>
    );
  }
  
  if (verificationFailed || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="mb-6 text-gray-700">
            Your administrator session could not be verified or has expired.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetryVerification} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Verification
            </Button>
            <Button onClick={handleManualLogout} variant="outline" className="w-full">
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader pageTitle={pageTitle} />
        <div className="p-6 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
