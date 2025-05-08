
import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { admin, isAdminLoading, isAdminAuthenticated, checkAdminSession } = useAdminAuth();
  const [isVerifying, setIsVerifying] = React.useState(true);
  
  React.useEffect(() => {
    const verifyAdmin = async () => {
      setIsVerifying(true);
      await checkAdminSession();
      setIsVerifying(false);
    };
    
    if (!isAdminLoading) {
      verifyAdmin();
    }
  }, [isAdminLoading, checkAdminSession]);
  
  if (isAdminLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying administrator access...</span>
      </div>
    );
  }
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
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
