
import React from 'react';
import { Mail } from 'lucide-react';

interface SignUpSuccessProps {
  hasPendingFormData: boolean;
}

export const SignUpSuccess: React.FC<SignUpSuccessProps> = ({ hasPendingFormData }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Verification email sent</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              {hasPendingFormData 
                ? "Your account has been created and your form data has been submitted. Please check your email to verify your account."
                : "Please check your email and click the verification link to complete your registration."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
