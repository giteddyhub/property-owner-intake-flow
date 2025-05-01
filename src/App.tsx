import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import PaymentCancelled from './pages/PaymentCancelled';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ResidentSuccessPage from './pages/ResidentSuccessPage';
import ResidencyAssessmentPage from './pages/ResidencyAssessmentPage';
import DashboardPage from './pages/DashboardPage';
import TaxFilingServicePage from './pages/TaxFilingServicePage';
import LoginPage from './pages/LoginPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SuccessPage from './pages/SuccessPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Home route that redirects authenticated users to dashboard
const HomeRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If user is authenticated, check for any pending tax filing sessions
  if (user) {
    // Check for purchase ID in session storage
    const purchaseId = sessionStorage.getItem('purchaseId');
    
    if (purchaseId) {
      // If a purchase ID exists, redirect to the tax filing service
      return <Navigate to={`/tax-filing-service/${purchaseId}`} replace />;
    }
    
    // Otherwise, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // Not authenticated, show the home page
  return <>{children}</>;
};

// This component wraps the routes and handles location-based effects
const AppRoutes = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Check if the user is coming back from Stripe after a redirect
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      toast({
        title: 'Payment Successful!',
        description: 'Thank you for your payment.',
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: 'Payment Cancelled',
        description: 'Your payment was cancelled. Please try again.',
        type: 'error',
      });
    }
    
    // Check if user just verified their email
    if (location.hash === '#email-verification-success' && user) {
      // Check if there's a purchase ID in session storage
      const purchaseId = sessionStorage.getItem('purchaseId');
      
      if (purchaseId) {
        // Redirect to the tax filing service page
        window.location.href = `/tax-filing-service/${purchaseId}`;
      } else {
        // Redirect to dashboard if no purchase ID is found
        window.location.href = '/dashboard';
      }
    }
  }, [location.search, location.hash, toast, user]);

  return (
    <Routes>
      <Route path="/" element={
        <HomeRoute>
          <Index />
        </HomeRoute>
      } />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/success" element={<SuccessPage />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
