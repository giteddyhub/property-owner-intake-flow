
import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface VerificationStepsProps {
  verificationStatus: 'pending' | 'verified' | 'failed';
  formSubmittedDuringSignup: boolean;
  submissionCompleted: boolean;
  forceRetry: boolean;
}

const VerificationSteps: React.FC<VerificationStepsProps> = ({
  verificationStatus,
  formSubmittedDuringSignup,
  submissionCompleted,
  forceRetry
}) => {
  return (
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
  );
};

export default VerificationSteps;
