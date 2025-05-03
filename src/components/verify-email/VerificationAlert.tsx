
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';

interface VerificationAlertProps {
  verificationStatus: 'pending' | 'verified' | 'failed';
  formSubmittedDuringSignup: boolean;
  submissionCompleted: boolean;
  forceRetry: boolean;
  hasPendingFormData: boolean;
  processingSubmission: boolean;
  submissionError: string | null;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({
  verificationStatus,
  formSubmittedDuringSignup,
  submissionCompleted,
  forceRetry,
  hasPendingFormData,
  processingSubmission,
  submissionError
}) => {
  
  if (verificationStatus === 'verified') {
    return (
      <Alert className="bg-green-50 border border-green-200 text-green-800">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle>Email verified successfully</AlertTitle>
        <AlertDescription className="text-green-700">
          {formSubmittedDuringSignup || submissionCompleted ? 
            "Your information has been submitted successfully!" : 
            "Redirecting you to your dashboard..."}
        </AlertDescription>
      </Alert>
    );
  }

  if (verificationStatus === 'pending' && formSubmittedDuringSignup) {
    return (
      <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <AlertTitle>Your information has been saved</AlertTitle>
        <AlertDescription className="text-blue-700">
          Your form data has been submitted successfully. Please verify your email to access your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (verificationStatus === 'pending' && forceRetry) {
    return (
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
    );
  }

  if (verificationStatus === 'pending' && !formSubmittedDuringSignup && !forceRetry && hasPendingFormData) {
    return (
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
    );
  }

  if (processingSubmission) {
    return (
      <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        <AlertTitle>Submitting your information</AlertTitle>
        <AlertDescription className="text-blue-700">
          Please wait while we process your submission...
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default VerificationAlert;
