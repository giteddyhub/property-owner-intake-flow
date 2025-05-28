
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminBreadcrumb } from './navigation/AdminBreadcrumb';
import { ContextualHelp } from './help/ContextualHelp';
import { ProgressiveLoader } from './loading/ProgressiveLoader';
import { AdminErrorBoundary } from './error/AdminErrorBoundary';
import { useKeyboardShortcuts } from '@/hooks/admin/useKeyboardShortcuts';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { admin, isAdminLoading, isAdminAuthenticated, checkAdminSession, resetVerification, adminLogout } = useAdminAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initializing' | 'loading-data' | 'processing' | 'rendering' | 'complete'>('initializing');
  const navigate = useNavigate();
  
  // Enable keyboard shortcuts for admin pages
  useKeyboardShortcuts(true);
  
  // Get section from current path for contextual help
  const getSection = () => {
    const path = window.location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/accounts')) return 'accounts';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  useEffect(() => {
    // Progressive loading simulation
    const stages: typeof loadingStage[] = ['initializing', 'loading-data', 'processing', 'rendering', 'complete'];
    let currentStageIndex = 0;

    const progressInterval = setInterval(() => {
      if (currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        setLoadingStage(stages[currentStageIndex]);
      } else {
        clearInterval(progressInterval);
      }
    }, 300);

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
        setLoadingStage('complete');
      }
    };
    
    verifyAdmin();
    
    return () => clearInterval(progressInterval);
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
    setLoadingStage('initializing');
    
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
      setLoadingStage('complete');
    }
  };
  
  if (isAdminLoading || isVerifying || loadingStage !== 'complete') {
    return <ProgressiveLoader stage={loadingStage} />;
  }
  
  if (verificationFailed || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
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
    <AdminErrorBoundary>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-background flex w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <AdminHeader pageTitle={pageTitle} />
            <div className="p-6 flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <AdminBreadcrumb />
                <ContextualHelp section={getSection()} />
              </div>
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AdminErrorBoundary>
  );
};
