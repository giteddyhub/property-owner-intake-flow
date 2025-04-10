
import React from 'react';
import { FormProvider } from '@/contexts/FormContext';
import FormLayout from '@/components/form/FormLayout';

const Index = () => {
  return (
    <FormProvider>
      <FormLayout />
    </FormProvider>
  );
};

export default Index;
