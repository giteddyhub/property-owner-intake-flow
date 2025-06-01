
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import { SignupPage } from '@/pages/SignupPage';
import { ImprovedSignupPage } from '@/pages/ImprovedSignupPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import { Dashboard } from '@/pages/Dashboard';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import SuccessPage from '@/pages/SuccessPage';
import PaymentCancelled from '@/pages/PaymentCancelled';
import ResidencyAssessmentPage from '@/pages/ResidencyAssessmentPage';
import ResidentSuccessPage from '@/pages/ResidentSuccessPage';
import TaxFilingServicePage from '@/pages/TaxFilingServicePage';
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

// Route Components
import { ProtectedRoute } from './ProtectedRoute';
import { AnonymousRoute } from './AnonymousRoute';
import { AdminRoute } from './AdminRoute';
import { AdminRoutes } from './AdminRoutes';

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/residency-assessment" element={<ResidencyAssessmentPage />} />
        <Route path="/resident-success" element={<ResidentSuccessPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Anonymous Only Routes */}
        <Route path="/signup" element={<AnonymousRoute><SignupPage /></AnonymousRoute>} />
        <Route path="/improved-signup" element={<AnonymousRoute><ImprovedSignupPage /></AnonymousRoute>} />
        <Route path="/login" element={<AnonymousRoute><LoginPage /></AnonymousRoute>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/form" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
        <Route path="/payment-cancelled" element={<ProtectedRoute><PaymentCancelled /></ProtectedRoute>} />
        <Route path="/tax-filing" element={<ProtectedRoute><TaxFilingServicePage /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/*" element={
          <AdminRoutes>
            <Routes>
              <Route path="/" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/accounts" element={<AdminRoute><AdminAccountsPage /></AdminRoute>} />
              <Route path="/accounts/:id" element={<AdminRoute><AdminAccountDetailPage /></AdminRoute>} />
              <Route path="/submissions" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
              <Route path="/submissions/:id" element={<AdminRoute><AdminSubmissionDetailPage /></AdminRoute>} />
              <Route path="/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/advanced-users" element={<AdminRoute><AdminAdvancedUsersPage /></AdminRoute>} />
              <Route path="/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
              <Route path="/security" element={<AdminRoute><AdminSecurityPage /></AdminRoute>} />
            </Routes>
          </AdminRoutes>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};
