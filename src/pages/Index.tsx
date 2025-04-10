
import React, { useState } from 'react';
import { FormProvider } from '@/contexts/FormContext';
import FormLayout from '@/components/form/FormLayout';
import SignUpDialog from '@/components/form/SignUpDialog';

const Index = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleSignUpComplete = (userData: any) => {
    setUserData(userData);
    setShowSignUp(false);
    // In a real application, you would save this user data
    console.log('User signed up with:', userData);
  };

  return (
    <FormProvider>
      <FormLayout onSubmitAttempt={() => setShowSignUp(true)} isUserSignedUp={!!userData} />
      <SignUpDialog 
        open={showSignUp} 
        onOpenChange={setShowSignUp}
        onSignUpComplete={handleSignUpComplete}
      />
    </FormProvider>
  );
};

export default Index;
