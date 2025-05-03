
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/contexts/FormContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { ArrowLeft } from 'lucide-react';

interface ReviewActionsProps {
  prevStep: () => void;
  onSubmitButtonClick: () => void;
  isSubmitting: boolean;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ 
  prevStep, 
  onSubmitButtonClick, 
  isSubmitting,
  owners,
  properties,
  assignments 
}) => {
  const { user } = useAuth();
  
  // Store form data in session storage when the review page is shown
  React.useEffect(() => {
    // Only store form data if user is not logged in
    if (!user) {
      const formData = {
        owners,
        properties,
        assignments,
        contactInfo: {
          // Will be filled in during signup
          fullName: '',
          email: ''
        }
      };
      
      // Store in session storage for use after signup
      console.log('Storing form data for later submission:', formData);
      sessionStorage.setItem('pendingFormData', JSON.stringify(formData));
    }
  }, [owners, properties, assignments, user]);

  return (
    <div className="flex flex-col-reverse md:flex-row justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={prevStep}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <Button 
        onClick={onSubmitButtonClick}
        disabled={isSubmitting}
        className="bg-form-300 hover:bg-form-400 text-white"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Submit'}
      </Button>
    </div>
  );
};

export default ReviewActions;
