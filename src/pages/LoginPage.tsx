
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleLoginSuccess = () => {
    setIsLoading(true);
    // The SignInForm component will handle the redirect to dashboard
  };
  
  const handleBackToHome = () => {
    // Redirect to the external website instead of navigating within the app
    window.location.href = "https://www.italiantaxes.com/";
  };
  
  return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2" onClick={handleBackToHome} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="space-y-4 mb-6">
            <h1 className="text-2xl font-bold text-center text-form-400">Sign In</h1>
            <p className="text-center text-gray-600">Access your account to view your tax information, filings, and more.</p>
          </div>

          <SignInForm onSuccess={handleLoginSuccess} />
        </div>

        <div className="text-center text-sm text-gray-600 mt-4">
          Need help?{' '}
          <a href="mailto:support@italiantaxes.com" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </div>
      </div>
    </div>;
};

export default LoginPage;
