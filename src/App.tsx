import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthRoutes } from './components/routing/AuthRoutes';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AdminRoutes } from './components/routing/AdminRoutes';
import { AdminRoute } from './components/routing/AdminRoute';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAccountsPage } from './pages/admin/AdminAccountsPage';
import { AdminAccountDetailPage } from './pages/admin/AdminAccountDetailPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminSubmissionDetailPage } from './pages/admin/AdminSubmissionDetailPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminErrorBoundary } from './components/admin/AdminErrorBoundary';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClient.Provider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AdminRoutes>
            <AdminErrorBoundary>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <AuthRoutes>
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </AuthRoutes>
                    }
                  />
                  
                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsersPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/accounts"
                    element={
                      <AdminRoute>
                        <AdminAccountsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/accounts/:id"
                    element={
                      <AdminRoute>
                        <AdminAccountDetailPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/submissions"
                    element={
                      <AdminRoute>
                        <AdminSubmissionsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/submissions/:id"
                    element={
                      <AdminRoute>
                        <AdminSubmissionDetailPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <AdminRoute>
                        <AdminSettingsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/security"
                    element={
                      <AdminRoute>
                        <AdminSecurityPage />
                      </AdminRoute>
                    }
                  />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<div>Page not found</div>} />
                </Routes>
                <Toaster />
              </div>
            </AdminErrorBoundary>
          </AdminRoutes>
        </ThemeProvider>
      </Router>
    </QueryClient.Provider>
  );
}

export default App;
