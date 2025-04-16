
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import SuccessPage from './pages/SuccessPage';
import PaymentCancelled from './pages/PaymentCancelled';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import ResidentSuccessPage from './pages/ResidentSuccessPage';
import ResidencyAssessmentPage from './pages/ResidencyAssessmentPage';

function App() {
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
    <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/ResidentSuccessPage" element={<ResidentSuccessPage />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/residency-assessment" element={<ResidencyAssessmentPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
      <Toaster />
    </div>
  );
}

export default App;
