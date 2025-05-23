
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import VerificationAlert from '@/components/verify-email/VerificationAlert';
import VerificationSteps from '@/components/verify-email/VerificationSteps';
import VerificationActions from '@/components/verify-email/VerificationActions';
import LoadingRedirect from '@/components/verify-email/LoadingRedirect';
import { useEmailVerification } from '@/hooks/useEmailVerification';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userEmail,
    verificationStatus,
    submissionError,
    redirecting,
    hasPendingFormData,
    formSubmittedDuringSignup,
    forceRetry,
    processingSubmission,
    submissionCompleted
  } = useEmailVerification();

  // If we're redirecting automatically, just show a minimal loading screen
  if (redirecting) {
    return <LoadingRedirect />;
  }

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
                
                <VerificationAlert
                  verificationStatus={verificationStatus}
                  formSubmittedDuringSignup={formSubmittedDuringSignup}
                  submissionCompleted={submissionCompleted}
                  forceRetry={forceRetry}
                  hasPendingFormData={hasPendingFormData}
                  processingSubmission={processingSubmission}
                  submissionError={submissionError}
                />
                
                <VerificationSteps
                  verificationStatus={verificationStatus}
                  formSubmittedDuringSignup={formSubmittedDuringSignup}
                  submissionCompleted={submissionCompleted}
                  forceRetry={forceRetry}
                />
              </div>
              
              <VerificationActions verificationStatus={verificationStatus} />
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Didn't receive an email? Check your spam folder or</p>
            <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
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
