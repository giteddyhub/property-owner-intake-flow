
import React from 'react';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { SignUpFormFields } from './SignUpFormFields';
import { SignUpSuccess } from './SignUpSuccess';
import { SignUpSubmitButton } from './SignUpSubmitButton';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectAfterAuth = false
}) => {
  const { formState, updateField, handleSubmit } = useSignUpForm({ 
    onSuccess, 
    redirectAfterAuth 
  });
  
  const { 
    fullName, 
    email, 
    password, 
    isSubmitting, 
    isSignedUp, 
    hasPendingFormData 
  } = formState;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SignUpFormFields 
        fullName={fullName}
        email={email}
        password={password}
        onFullNameChange={(value) => updateField('fullName', value)}
        onEmailChange={(value) => updateField('email', value)}
        onPasswordChange={(value) => updateField('password', value)}
        disabled={isSubmitting || isSignedUp}
      />
      
      {isSignedUp ? (
        <SignUpSuccess />
      ) : (
        <SignUpSubmitButton 
          isSubmitting={isSubmitting} 
          hasPendingFormData={hasPendingFormData} 
        />
      )}
    </form>
  );
};
