
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  resetVerification: () => void;
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
  
  // Add verification state tracking
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const verificationInProgress = useRef(false);
  const maxVerificationAttempts = 3;
  
  const navigate = useNavigate();
  
  // Reset verification state
  const resetVerification = useCallback(() => {
    setVerificationAttempts(0);
    verificationInProgress.current = false;
  }, []);
  
  // Memoize checkAdminSession to prevent recreation on every render
  const checkAdminSession = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous verification attempts
    if (verificationInProgress.current) {
      console.log('Admin session verification already in progress, skipping');
      return !!admin;
    }
    
    // Clear any previous errors
    setAdminLoginError(null);
    
    // If max verification attempts reached, prevent further attempts
    if (verificationAttempts >= maxVerificationAttempts) {
      console.warn(`Maximum verification attempts (${maxVerificationAttempts}) reached`);
      setIsAdminLoading(false);
      return false;
    }
    
    // If no session token, not authenticated
    if (!adminSession?.token) {
      setAdmin(null);
      setAdminSession(null);
      return false;
    }
    
    try {
      verificationInProgress.current = true;
      setVerificationAttempts(prev => prev + 1);
      
      console.log(`Verifying admin session (attempt ${verificationAttempts + 1}/${maxVerificationAttempts})`);
      
      const { data, error } = await supabase.functions.invoke('admin-session', {
        body: { token: adminSession.token }
      });
      
      if (error || !data || !data.admin) {
        console.error('Admin session validation error:', error);
        setAdmin(null);
        setAdminSession(null);
        localStorage.removeItem('admin_session');
        verificationInProgress.current = false;
        return false;
      }
      
      setAdmin(data.admin);
      verificationInProgress.current = false;
      return true;
    } catch (error: any) {
      console.error('Error checking admin session:', error);
      setAdmin(null);
      setAdminSession(null);
      localStorage.removeItem('admin_session');
      verificationInProgress.current = false;
      return false;
    }
  }, [admin, adminSession, verificationAttempts]);
  
  // Check if admin session is valid on initial load
  useEffect(() => {
    const validateSession = async () => {
      // Only check if we have a stored session and haven't reached max attempts
      if (storedSession?.token && verificationAttempts < maxVerificationAttempts) {
        await checkAdminSession();
      } else if (!storedSession?.token) {
        // No stored session, so we're not loading anymore
        console.log('No stored admin session found');
      }
      
      // Always set loading to false after initial check
      setIsAdminLoading(false);
    };
    
    validateSession();
  }, [checkAdminSession, storedSession, verificationAttempts]);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setIsAdminLoading(true);
    setAdminLoginError(null);
    resetVerification();
    
    try {
      console.log('[AdminAuth] Attempting admin login for:', email);
      
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { email, password }
      });
      
      if (error) {
        console.error('[AdminAuth] Admin login error:', error);
        const errorMessage = error.message || 'Invalid credentials or server error';
        setAdminLoginError(errorMessage);
        setIsAdminLoading(false);
        return false;
      }
      
      if (!data) {
        console.error('[AdminAuth] No data returned from admin login');
        setAdminLoginError('No response from server');
        setIsAdminLoading(false);
        return false;
      }
      
      const { admin: newAdmin, session: newSession } = data;
      
      if (!newAdmin || !newSession) {
        console.error('[AdminAuth] Invalid response structure:', data);
        setAdminLoginError('Invalid server response');
        setIsAdminLoading(false);
        return false;
      }
      
      console.log('[AdminAuth] Admin login successful for:', newAdmin.email);
      
      // Store admin and session
      setAdmin(newAdmin);
      setAdminSession(newSession);
      
      // Save to localStorage
      localStorage.setItem('admin_session', JSON.stringify({ admin: newAdmin, session: newSession }));
      
      setIsAdminLoading(false);
      return true;
    } catch (error: any) {
      console.error('[AdminAuth] Admin login exception:', error);
      setAdminLoginError(error.message || 'Failed to login - connection error');
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
      resetVerification();
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
        checkAdminSession,
        resetVerification
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
