
import React, { useState } from 'react';
import { FormProvider } from '@/contexts/FormContext';
import FormLayout from '@/components/form/FormLayout';
import SignUpDialog from '@/components/form/SignUpDialog';

const Index = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleSignUpComplete = (userData: any) => {
    setUserData(userData);
    setShowSignUp(false);
    // In a real application, you would save the form data along with the user data
    console.log('User signed up with:', userData);
    console.log('Form data to be submitted:', formData);
  };

  // Modified to match the expected function signature in FormLayout
  const handleFormSubmitAttempt = (formData: any) => {
    // Store the form data to submit after signup
    setFormData(formData);
    setShowSignUp(true);
  };

  return (
    <FormProvider>
      <FormLayout 
        onSubmitAttempt={handleFormSubmitAttempt} 
        isUserSignedUp={!!userData} 
      />
      <SignUpDialog 
        open={showSignUp} 
        onOpenChange={setShowSignUp}
        onSignUpComplete={handleSignUpComplete}
        formData={formData}
      />
    </FormProvider>
  );
};

export default Index;
