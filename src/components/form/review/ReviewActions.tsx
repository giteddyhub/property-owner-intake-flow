
import React from 'react';
import { Button } from '@/components/ui/button';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

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
  isSubmitting
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
      <Button 
        variant="outline" 
        onClick={prevStep}
        className="w-full sm:w-auto"
      >
        Back
      </Button>
      
      <Button 
        onClick={onSubmitButtonClick}
        disabled={isSubmitting}
        className="bg-form-300 hover:bg-form-400 text-white w-full sm:w-auto"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
};

export default ReviewActions;

