
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const location = useLocation();
  
  if (isAdminLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
