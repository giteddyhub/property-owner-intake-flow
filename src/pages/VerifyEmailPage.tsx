
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';

interface VerifyEmailPageProps {
  email?: string;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ email }) => {
  const navigate = useNavigate();
  const userEmail = email || sessionStorage.getItem('pendingUserEmail') || 'your email';
  
  // Check if there's pending form data to show appropriate messaging
  const hasPendingFormData = sessionStorage.getItem('pendingFormData') !== null;
  const formAlreadySubmitted = !hasPendingFormData && sessionStorage.getItem('redirectToDashboard') === 'true';
  
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-form-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-form-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    We've sent a verification link to:
                  </p>
                  <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center justify-center gap-2 text-form-700 font-medium">
                    <Mail className="h-4 w-4" />
                    <span>{userEmail}</span>
                  </div>
                  <p className="text-gray-600 mt-4">
                    Please check your email and click the verification link to complete your registration.
                  </p>
                </div>
                
                {formAlreadySubmitted && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 my-2">
                    <h3 className="font-semibold text-green-800 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Your information has been submitted successfully
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                      After verifying your email, you'll be able to access all your property information in your dashboard.
                    </p>
                  </div>
                )}
                
                {hasPendingFormData && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-2">
                    <h3 className="font-semibold text-yellow-800 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-yellow-600" />
                      Email verification required
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Your information is ready to be submitted after you verify your email.
                    </p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 w-full my-4 pt-4">
                  <h2 className="text-lg font-semibold mb-2">What happens next?</h2>
                  <ul className="text-sm text-left space-y-3">
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>After verification, you'll be automatically redirected to your dashboard</span>
                    </li>
                    {formAlreadySubmitted && (
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span><strong>Your information has already been processed</strong> - it will be waiting for you in your dashboard</span>
                      </li>
                    )}
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>You'll have instant access to all your property information</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>You can manage all your property details from your dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Button onClick={handleBackToLogin} className="w-full mt-6">
                Return to Login
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Didn't receive an email? Check your spam folder or</p>
            <Button variant="link" className="p-0" onClick={handleBackToLogin}>
              try signing in again
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
