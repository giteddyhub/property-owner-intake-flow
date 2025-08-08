
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import { ModernSignupPage } from '@/pages/ModernSignupPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import TaxFilingServicePage from '@/pages/TaxFilingServicePage';
import ResidencyAssessmentPage from '@/pages/ResidencyAssessmentPage';
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminAccountsPage from '@/pages/admin/AdminAccountsPage';
import AdminAccountDetailPage from '@/pages/admin/AdminAccountDetailPage';
import AdminSubmissionsPage from '@/pages/admin/AdminSubmissionsPage';
import AdminSubmissionDetailPage from '@/pages/admin/AdminSubmissionDetailPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAdvancedUsersPage from '@/pages/admin/AdminAdvancedUsersPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminSecurityPage from '@/pages/admin/AdminSecurityPage';

import { RefineAdminApp } from '@/admin/refine/RefineAdminApp';
// Route Components
import { ProtectedRoute } from './ProtectedRoute';
import { AnonymousRoute } from './AnonymousRoute';
import { AdminRoute } from './AdminRoute';
import { AdminRoutes } from './AdminRoutes';

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Root Route - handles auth redirection */}
        <Route path="/" element={<Index />} />
        
        {/* Public Routes */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/residency-assessment" element={<ResidencyAssessmentPage />} />
        
        {/* Anonymous Only Routes */}
        <Route path="/signup" element={<AnonymousRoute><ModernSignupPage /></AnonymousRoute>} />
        <Route path="/login" element={<AnonymousRoute><LoginPage /></AnonymousRoute>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
        <Route path="/tax-filing-service/:sessionId" element={<ProtectedRoute><TaxFilingServicePage /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/*" element={
          <AdminRoutes>
            <RefineAdminApp />
          </AdminRoutes>
        } />
        
        {/* Legacy redirects */}
        <Route path="/accounts" element={<Navigate to="/admin/accounts" replace />} />
        <Route path="/accounts/:id" element={<Navigate to="/admin/accounts/:id" replace />} />
        <Route path="/admin/users" element={<Navigate to="/admin/accounts" replace />} />
        <Route path="/users" element={<Navigate to="/admin/accounts" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};
