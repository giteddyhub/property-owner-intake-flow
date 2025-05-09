import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProtectedRoute } from './ProtectedRoute';
import { AnonymousRoute } from './AnonymousRoute';
import { AdminRoutes } from './AdminRoutes';
import { AdminRoute } from './AdminRoute';

// Import pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import PaymentCancelled from '@/pages/PaymentCancelled';
import NotFound from '@/pages/NotFound';
import ResidentSuccessPage from '@/pages/ResidentSuccessPage';
import ResidencyAssessmentPage from '@/pages/ResidencyAssessmentPage';
import DashboardPage from '@/pages/DashboardPage';
import TaxFilingServicePage from '@/pages/TaxFilingServicePage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAccountsPage from '@/pages/admin/AdminAccountsPage';
import AdminSubmissionDetailPage from '@/pages/admin/AdminSubmissionDetailPage';
import AdminAccountDetailPage from '@/pages/admin/AdminAccountDetailPage';

export const AppRoutes: React.FC = () => {
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
      <Route path="/" element={<Index />} />
      <Route path="/login" element={
        <AnonymousRoute>
          <LoginPage />
        </AnonymousRoute>
      } />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
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
        <AdminRoutes>
          <AdminLoginPage />
        </AdminRoutes>
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
