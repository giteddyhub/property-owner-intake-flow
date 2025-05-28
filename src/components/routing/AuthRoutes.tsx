
import React from 'react';
import { AuthProvider } from '@/contexts/auth/AuthContext';

interface AuthRoutesProps {
  children: React.ReactNode;
}

export const AuthRoutes: React.FC<AuthRoutesProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
