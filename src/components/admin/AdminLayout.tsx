
import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { user, loading, isAdmin, checkAdminStatus } = useAuth();
  const [isCheckingAdmin, setIsCheckingAdmin] = React.useState(true);
  
  React.useEffect(() => {
    const verifyAdmin = async () => {
      setIsCheckingAdmin(true);
      await checkAdminStatus();
      setIsCheckingAdmin(false);
    };
    
    if (user && !loading) {
      verifyAdmin();
    } else if (!loading) {
      setIsCheckingAdmin(false);
    }
  }, [user, loading, checkAdminStatus]);
  
  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
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
