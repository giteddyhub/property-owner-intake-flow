
import React from 'react';
import { FormProvider } from '@/contexts/FormContext';
import FormLayout from '@/components/form/FormLayout';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <FormProvider>
          <FormLayout />
        </FormProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
