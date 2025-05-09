
import React from 'react';
import { AdminAuthProvider } from '@/contexts/admin/AdminAuthContext';

interface AdminRoutesProps {
  children: React.ReactNode;
}

export const AdminRoutes: React.FC<AdminRoutesProps> = ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};
