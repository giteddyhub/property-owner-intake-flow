
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, processingSubmission } = useAuth();
  const userEmail = sessionStorage.getItem('pendingUserEmail') || 'your email';
  const [verificationStatus, setVerificationStatus] = useState<'pending'|'verified'|'failed'>('pending');
  
  // Check if there's pending form data to show appropriate messaging
  const hasPendingFormData = sessionStorage.getItem('pendingFormData') !== null;
  const formSubmittedDuringSignup = sessionStorage.getItem('formSubmittedDuringSignup') === 'true';
  const formAlreadySubmitted = formSubmittedDuringSignup;
  
  // Monitor authentication state
  useEffect(() => {
    console.log("[VerifyEmailPage] Component mounted, current user:", user?.id);
    console.log("[VerifyEmailPage] Has pending form data:", hasPendingFormData);
    console.log("[VerifyEmailPage] Processing submission:", processingSubmission);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[VerifyEmailPage] Auth state change:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          console.log("[VerifyEmailPage] Email confirmed, user is verified");
          toast.success("Email verified successfully!");
          setVerificationStatus('verified');
          
          // Check for and handle pending form data
          const pendingData = sessionStorage.getItem('pendingFormData');
          const submitAfterVerification = sessionStorage.getItem('submitAfterVerification');
          
          if (pendingData && submitAfterVerification === 'true' && !formAlreadySubmitted) {
            console.log("[VerifyEmailPage] Found pending form data to submit");
            toast.info("Submitting your information now...");
            
            // Force a retry on submission now that email is verified
            sessionStorage.setItem('forceRetrySubmission', 'true');
            
            // Set redirect flag and wait a moment to allow AuthContext to process submission
            sessionStorage.setItem('redirectToDashboard', 'true');
            
            // Delayed redirect to dashboard to allow time for form processing
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else if (sessionStorage.getItem('redirectToDashboard') === 'true') {
            console.log("[VerifyEmailPage] Redirecting to dashboard as requested");
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[VerifyEmailPage] Token refreshed, checking email verification status");
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          setVerificationStatus('verified');
          toast.success("Email verified successfully!");
        }
      }
    });
    
    // Check if user is already verified on mount
    if (user?.email_confirmed_at || user?.confirmed_at) {
      console.log("[VerifyEmailPage] User already verified on mount");
      setVerificationStatus('verified');
    }
    
    return () => {
      subscription.unsubscribe();
    }
  }, [navigate, user, processingSubmission, formAlreadySubmitted, hasPendingFormData]);
  
  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = async () => {
    try {
      const email = sessionStorage.getItem('pendingUserEmail');
      if (!email) {
        toast.error("No email found to resend verification");
        return;
      }
      
      await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      toast.success("Verification email resent, please check your inbox");
    } catch (error) {
      console.error("[VerifyEmailPage] Error resending verification:", error);
      toast.error("Failed to resend verification email");
    }
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
                
                {verificationStatus === 'verified' && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 my-2">
                    <h3 className="font-semibold text-green-800 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Email verified successfully
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                      {formAlreadySubmitted ? 
                        "Your information has been submitted successfully!" : 
                        "Your information will now be processed automatically."}
                    </p>
                  </div>
                )}
                
                {verificationStatus === 'pending' && hasPendingFormData && !formAlreadySubmitted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-2">
                    <h3 className="font-semibold text-yellow-800 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-yellow-600" />
                      Email verification required
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Your information is ready to be submitted after you verify your email.
                      <span className="block mt-1">This happens automatically - just click the link in your email.</span>
                    </p>
                    <div className="flex items-center justify-center mt-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-yellow-600" />
                      <span className="text-sm text-yellow-700">Waiting for verification</span>
                    </div>
                  </div>
                )}
                
                {processingSubmission && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 my-2">
                    <h3 className="font-semibold text-blue-800 flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 text-blue-600 animate-spin" />
                      Submitting your information
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Please wait while we process your submission...
                    </p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 w-full my-4 pt-4">
                  <h2 className="text-lg font-semibold mb-2">What happens next?</h2>
                  <ul className="text-sm text-left space-y-3">
                    <li className="flex gap-2">
                      {verificationStatus === 'verified' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                      )}
                      <span>After verification, you'll be automatically redirected to your dashboard</span>
                    </li>
                    {formAlreadySubmitted ? (
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span><strong>Your information has already been processed</strong> - it will be waiting for you in your dashboard</span>
                      </li>
                    ) : hasPendingFormData ? (
                      <li className="flex gap-2">
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                        <span><strong>Your form data is waiting</strong> - it will be submitted automatically after verification</span>
                      </li>
                    ) : null}
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>You'll have instant access to all your property information</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 mt-6">
                <Button onClick={handleBackToLogin} className="w-full">
                  Return to Login
                </Button>
                
                {verificationStatus === 'pending' && (
                  <Button variant="outline" onClick={handleResendVerification} className="w-full mt-2">
                    Resend Verification Email
                  </Button>
                )}
              </div>
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
