import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages';
import SuccessPage from './pages/SuccessPage';
import PaymentCancelled from './pages/PaymentCancelled';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from '@/components/theme-provider';
import ResidentSuccessPage from './pages/ResidentSuccessPage';

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
        variant: 'destructive',
      });
    }
  }, [location.search, toast]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-tailwind-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/ResidentSuccessPage" element={<ResidentSuccessPage />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
