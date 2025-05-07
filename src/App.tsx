
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import PaymentCancelled from './pages/PaymentCancelled';
import NotFound from './pages/NotFound';
import { Toaster, toast } from 'sonner';
import ResidentSuccessPage from './pages/ResidentSuccessPage';
import ResidencyAssessmentPage from './pages/ResidencyAssessmentPage';
import DashboardPage from './pages/DashboardPage';
import TaxFilingServicePage from './pages/TaxFilingServicePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import { AuthProvider, useAuth } from './contexts/auth/AuthContext';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin route component - redirects to dashboard if not admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, checkAdminStatus } = useAuth();
  const location = useLocation();
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    // If logged in but not admin, redirect to admin login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Authenticated route component - redirects to dashboard if authenticated
const AnonymousRoute = ({ children }: { children: React.ReactNode }) => {
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

// This component wraps the routes and handles location-based effects
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if the user is coming back from Stripe after a redirect
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      toast.success('Payment Successful!', {
        description: 'Thank you for your payment.',
      });
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment Cancelled', {
        description: 'Your payment was cancelled. Please try again.',
      });
    }
  }, [location.search]);

  return (
    <Routes>
      <Route path="/" element={
        <Index />
      } />
      <Route path="/login" element={
        <AnonymousRoute>
          <LoginPage />
        </AnonymousRoute>
      } />
      <Route path="/verify-email" element={
        <VerifyEmailPage />
      } />
      <Route path="/ResidentSuccessPage" element={<ResidentSuccessPage />} />
      <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      <Route path="/residency-assessment" element={<ResidencyAssessmentPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/account-settings" element={
        <ProtectedRoute>
          <AccountSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/tax-filing-service/:sessionId" element={
        <ProtectedRoute>
          <TaxFilingServicePage />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsersPage />
        </AdminRoute>
      } />
      <Route path="/admin/properties" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/submissions" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/documents" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/analytics" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/settings" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster position="top-right" closeButton={true} richColors />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
