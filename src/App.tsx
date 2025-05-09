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
import { AdminAuthProvider, useAdminAuth } from './contexts/admin/AdminAuthContext';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import AdminSubmissionDetailPage from './pages/admin/AdminSubmissionDetailPage';
import AdminAccountDetailPage from './pages/admin/AdminAccountDetailPage';

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

// Admin routes component that applies AdminAuthProvider
const AdminRoutes = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};

// Admin route component - redirects to admin login if not authenticated as admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
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
      <Route path="/admin/login" element={
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      } />
      <Route path="/admin" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        </AdminRoutes>
      } />
      <Route path="/admin/users" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        </AdminRoutes>
      } />
      
      {/* Redirect from old /admin/submissions to new /admin/accounts */}
      <Route path="/admin/submissions" element={
        <Navigate to="/admin/accounts" replace />
      } />
      
      {/* New Accounts Routes */}
      <Route path="/admin/accounts" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminAccountsPage />
          </AdminRoute>
        </AdminRoutes>
      } />
      <Route path="/admin/accounts/:id" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminAccountDetailPage />
          </AdminRoute>
        </AdminRoutes>
      } />
      
      {/* Keep the submission detail route as it is */}
      <Route path="/admin/submissions/:id" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminSubmissionDetailPage />
          </AdminRoute>
        </AdminRoutes>
      } />
      
      <Route path="/admin/settings" element={
        <AdminRoutes>
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        </AdminRoutes>
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
