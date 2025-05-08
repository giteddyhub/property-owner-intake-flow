
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  is_super_admin: boolean;
};

type AdminSession = {
  token: string;
  expires_at: string;
};

type AdminAuthContextType = {
  admin: AdminUser | null;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminLoginError: string | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  checkAdminSession: () => Promise<boolean>;
};

// Create the context with a default value
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Get admin session from localStorage
const getStoredAdminSession = (): { admin: AdminUser | null, session: AdminSession | null } => {
  try {
    const adminSessionStr = localStorage.getItem('admin_session');
    if (adminSessionStr) {
      const adminSession = JSON.parse(adminSessionStr);
      
      // Check if session is expired
      if (adminSession.session && new Date(adminSession.session.expires_at) < new Date()) {
        // Session expired, clear it
        localStorage.removeItem('admin_session');
        return { admin: null, session: null };
      }
      
      return adminSession;
    }
  } catch (error) {
    console.error('Error loading admin session:', error);
  }
  
  return { admin: null, session: null };
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin: storedAdmin, session: storedSession } = getStoredAdminSession();
  const [admin, setAdmin] = useState<AdminUser | null>(storedAdmin);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(storedSession);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Check if admin session is valid on initial load
  useEffect(() => {
    const validateSession = async () => {
      await checkAdminSession();
      setIsAdminLoading(false);
    };
    
    validateSession();
  }, []);
  
  const checkAdminSession = async (): Promise<boolean> => {
    // Clear any previous errors
    setAdminLoginError(null);
    
    // If no session token, not authenticated
    if (!adminSession?.token) {
      setAdmin(null);
      setAdminSession(null);
      return false;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-session', {
        body: { token: adminSession.token }
      });
      
      if (error || !data || !data.admin) {
        console.error('Admin session validation error:', error);
        setAdmin(null);
        setAdminSession(null);
        localStorage.removeItem('admin_session');
        return false;
      }
      
      setAdmin(data.admin);
      return true;
    } catch (error: any) {
      console.error('Error checking admin session:', error);
      setAdmin(null);
      setAdminSession(null);
      localStorage.removeItem('admin_session');
      return false;
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setIsAdminLoading(true);
    setAdminLoginError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { email, password }
      });
      
      if (error || !data) {
        console.error('Admin login error:', error);
        setAdminLoginError(error?.message || 'Invalid credentials');
        setIsAdminLoading(false);
        return false;
      }
      
      const { admin: newAdmin, session: newSession } = data;
      
      if (!newAdmin || !newSession) {
        setAdminLoginError('Failed to get admin credentials');
        setIsAdminLoading(false);
        return false;
      }
      
      // Store admin and session
      setAdmin(newAdmin);
      setAdminSession(newSession);
      
      // Save to localStorage
      localStorage.setItem('admin_session', JSON.stringify({ admin: newAdmin, session: newSession }));
      
      setIsAdminLoading(false);
      return true;
    } catch (error: any) {
      console.error('Admin login error:', error);
      setAdminLoginError(error.message || 'Failed to login');
      setIsAdminLoading(false);
      return false;
    }
  };
  
  const adminLogout = async (): Promise<void> => {
    setIsAdminLoading(true);
    
    try {
      if (adminSession?.token) {
        await supabase.functions.invoke('admin-logout', {
          body: { token: adminSession.token }
        });
      }
    } catch (error) {
      console.error('Error during admin logout:', error);
    } finally {
      // Clear admin state even if API call fails
      setAdmin(null);
      setAdminSession(null);
      localStorage.removeItem('admin_session');
      setIsAdminLoading(false);
      navigate('/admin/login');
    }
  };
  
  return (
    <AdminAuthContext.Provider 
      value={{
        admin,
        adminSession,
        isAdminAuthenticated: !!admin && !!adminSession,
        isAdminLoading,
        adminLoginError,
        adminLogin,
        adminLogout,
        checkAdminSession
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
