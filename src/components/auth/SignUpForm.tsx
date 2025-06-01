
import React from 'react';
import { SignUpFormFields } from './SignUpFormFields';
import { SignUpSubmitButton } from './SignUpSubmitButton';
import { SignUpSuccess } from './SignUpSuccess';
import { useImprovedSignUpForm } from '@/hooks/useImprovedSignUpForm';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const { formState, updateField, handleSubmit } = useImprovedSignUpForm({
    onSuccess,
    redirectAfterAuth: false
  });

  if (formState.isSignedUp) {
    return <SignUpSuccess hasPendingFormData={formState.hasPendingFormData} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SignUpFormFields
        formState={formState}
        updateField={updateField}
      />
      <SignUpSubmitButton
        isSubmitting={formState.isSubmitting}
        hasPendingFormData={formState.hasPendingFormData}
      />
    </form>
  );
};
