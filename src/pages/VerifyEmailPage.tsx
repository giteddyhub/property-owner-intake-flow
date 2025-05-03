import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, processingSubmission, submissionCompleted } = useAuth();
  const userEmail = sessionStorage.getItem('pendingUserEmail') || 'your email';
  const [verificationStatus, setVerificationStatus] = useState<'pending'|'verified'|'failed'>('pending');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Get submission data from session storage
  const hasPendingFormData = sessionStorage.getItem('pendingFormData') !== null;
  const formSubmittedDuringSignup = sessionStorage.getItem('formSubmittedDuringSignup') === 'true';
  const forceRetry = sessionStorage.getItem('forceRetrySubmission') === 'true';
  const emailJustVerified = sessionStorage.getItem('emailJustVerified') === 'true';
  
  // Check for submission errors
  useEffect(() => {
    const errorMsg = sessionStorage.getItem('submissionError');
    if (errorMsg) {
      setSubmissionError(errorMsg);
    }
  }, []);

  // Handle automatic redirect if coming from email verification link
  useEffect(() => {
    if (emailJustVerified) {
      console.log("[VerifyEmailPage] Email was just verified via link, preparing quick redirect");
      setVerificationStatus('verified');
      setRedirecting(true);
      
      // Clear the flag
      sessionStorage.removeItem('emailJustVerified');
      
      // Show a notification
      toast.success("Email verified successfully! Redirecting to dashboard...");
      
      // Redirect to dashboard immediately
      navigate('/dashboard', { replace: true });
    }
  }, [emailJustVerified, navigate]);
  
  // Monitor authentication state
  useEffect(() => {
    // Skip the rest of this effect if we're already redirecting
    if (redirecting) return;
    
    console.log("[VerifyEmailPage] Component mounted, current user:", user?.id);
    console.log("[VerifyEmailPage] Has pending form data:", hasPendingFormData);
    console.log("[VerifyEmailPage] Processing submission:", processingSubmission);
    console.log("[VerifyEmailPage] Submission completed:", submissionCompleted);
    console.log("[VerifyEmailPage] Form submitted during signup:", formSubmittedDuringSignup);
    console.log("[VerifyEmailPage] Force retry flag:", forceRetry);
    console.log("[VerifyEmailPage] Submission error:", submissionError);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[VerifyEmailPage] Auth state change:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          console.log("[VerifyEmailPage] Email confirmed, user is verified");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages if we already displayed them elsewhere
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard shortly after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[VerifyEmailPage] Token refreshed, checking email verification status");
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    });
    
    // Check if user is already verified on mount
    if (user?.email_confirmed_at || user?.confirmed_at) {
      console.log("[VerifyEmailPage] User already verified on mount");
      setVerificationStatus('verified');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    // Check session every 5 seconds to detect email verification
    const checkInterval = setInterval(async () => {
      if (verificationStatus === 'verified') return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email_confirmed_at || data.session?.user?.confirmed_at) {
          console.log("[VerifyEmailPage] Email verified detected in interval check");
          setVerificationStatus('verified');
          
          // Don't show redundant toast messages
          if (!formSubmittedDuringSignup) {
            toast.success("Email verified successfully!");
          }
          
          // Redirect to dashboard after verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error("[VerifyEmailPage] Error checking session:", error);
      }
    }, 5000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    }
  }, [navigate, user, processingSubmission, submissionCompleted, verificationStatus, formSubmittedDuringSignup, redirecting]);
  
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

  // If we're redirecting automatically, just show a minimal loading screen
  if (redirecting) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-form-600 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900">Redirecting to dashboard...</h1>
              <p className="text-gray-600">
                Email verified successfully!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
                
                {verificationStatus === 'verified' && (
                  <Alert className="bg-green-50 border border-green-200 text-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertTitle>Email verified successfully</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {formSubmittedDuringSignup || submissionCompleted ? 
                        "Your information has been submitted successfully!" : 
                        "Redirecting you to your dashboard..."}
                    </AlertDescription>
                  </Alert>
                )}
                
                {verificationStatus === 'pending' && formSubmittedDuringSignup && (
                  <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <AlertTitle>Your information has been saved</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Your form data has been submitted successfully. Please verify your email to access your dashboard.
                    </AlertDescription>
                  </Alert>
                )}
                
                {verificationStatus === 'pending' && forceRetry && (
                  <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-800">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <AlertTitle>Form submission pending</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Your form data has been saved. We'll process your submission once you verify your email.
                      {submissionError && (
                        <p className="text-xs mt-1 italic">
                          {submissionError}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {verificationStatus === 'pending' && !formSubmittedDuringSignup && !forceRetry && hasPendingFormData && (
                  <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-800">
                    <Mail className="h-5 w-5 text-yellow-600" />
                    <AlertTitle>Email verification required</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Please verify your email address to complete the submission process.
                      <div className="flex items-center justify-center mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-yellow-600" />
                        <span className="text-sm">Waiting for verification</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {processingSubmission && (
                  <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <AlertTitle>Submitting your information</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Please wait while we process your submission...
                    </AlertDescription>
                  </Alert>
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
                    {(formSubmittedDuringSignup || submissionCompleted) ? (
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span><strong>Your information has been saved</strong> - it will be waiting for you in your dashboard</span>
                      </li>
                    ) : forceRetry ? (
                      <li className="flex gap-2">
                        <Loader2 className="h-5 w-5 text-yellow-500 animate-spin flex-shrink-0" />
                        <span><strong>Your information will be submitted</strong> - once your email is verified</span>
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
