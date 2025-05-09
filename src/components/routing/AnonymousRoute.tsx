
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

interface AnonymousRouteProps {
  children: React.ReactNode;
}

export const AnonymousRoute: React.FC<AnonymousRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Don't redirect on verify-email page even if authenticated
  if (user && location.pathname !== '/verify-email') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
