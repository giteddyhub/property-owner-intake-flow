
import React from 'react';
import FormNavigation from '../FormNavigation';

interface WelcomeStepProps {
  onSave?: () => Promise<void>;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onSave }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-form-500 mb-4">Welcome to the Italy Tax Form Application</h2>
      <p className="mb-4">
        This application will guide you through the process of creating your Italian tax declaration.
      </p>
      <p className="mb-4">
        You'll go through the following steps:
      </p>
      <ol className="list-decimal list-inside space-y-2 mb-6">
        <li>Enter owner information</li>
        <li>Enter property details</li>
        <li>Assign ownership percentages</li>
        <li>Review and finalize your submission</li>
      </ol>
      <p className="mb-6">
        Your information will be automatically saved as you progress through each step, 
        allowing you to return and continue at any time.
      </p>
      
      <FormNavigation showBack={false} onSave={onSave} />
    </div>
  );
};

export default WelcomeStep;
