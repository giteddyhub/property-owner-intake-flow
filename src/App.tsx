
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import SuccessPage from './pages/SuccessPage';
import PaymentCancelled from './pages/PaymentCancelled';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ResidentSuccessPage from './pages/ResidentSuccessPage';
import ResidencyAssessmentPage from './pages/ResidencyAssessmentPage';

// This component wraps the routes and handles location-based effects
const AppRoutes = () => {
  const { toast } = useToast();
  const location = useLocation();

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
  }, [location.search, toast]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/ResidentSuccessPage" element={<ResidentSuccessPage />} />
      <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      <Route path="/residency-assessment" element={<ResidencyAssessmentPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <AppRoutes />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
