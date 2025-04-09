
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/contexts/FormContext';
import { ArrowRight } from 'lucide-react';

const WelcomeStep: React.FC = () => {
  const { nextStep } = useFormContext();

  return (
    <div className="text-center max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-form-400 mb-6">Property Owner Intake Form</h1>
      
      <div className="mb-10 text-left bg-form-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Welcome to the Intake Process</h2>
        
        <p className="mb-4">
          This form will guide you through the process of registering property ownership information 
          for tax purposes in Italy. Please have the following information ready:
        </p>
        
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Personal details for all property owners</li>
          <li>Property addresses and details</li>
          <li>Purchase/sale dates and prices (if applicable)</li>
          <li>Ownership percentages for each property</li>
          <li>Italian tax codes (if available)</li>
        </ul>
        
        <p className="mb-4">
          The form includes four main steps:
        </p>
        
        <ol className="list-decimal list-inside space-y-1 mb-6">
          <li><strong>Owner Profiles</strong> - Personal and residency information</li>
          <li><strong>Property Details</strong> - Addresses and activity information</li>
          <li><strong>Owner Assignments</strong> - Link owners to properties with percentages</li>
          <li><strong>Review & Submit</strong> - Verify and submit your information</li>
        </ol>
        
        <p>
          You can navigate between steps using the progress bar at the top.
          Your information will be saved as you progress through the form.
        </p>
      </div>
      
      <Button 
        onClick={nextStep}
        className="bg-form-300 hover:bg-form-400 text-white flex items-center gap-2 mx-auto"
        size="lg"
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WelcomeStep;
