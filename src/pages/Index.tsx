import React from 'react';
import { FormProvider } from '@/contexts/FormContext';
import FormLayout from '@/components/form/FormLayout';
import Footer from '@/components/layout/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileWarning from '@/components/mobile/MobileWarning';
import { AuthProvider } from '@/contexts/auth/AuthContext';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      {isMobile ? (
        <MobileWarning />
      ) : (
        <>
          <main className="flex-grow">
            <AuthProvider>
              <FormProvider>
                <FormLayout />
              </FormProvider>
            </AuthProvider>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
