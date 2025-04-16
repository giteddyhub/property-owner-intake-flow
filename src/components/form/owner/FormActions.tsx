
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  submitText: string;
  hideCancel?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onSubmit, 
  onCancel, 
  submitText, 
  hideCancel = false 
}) => {
  return (
    <div className="flex justify-end space-x-3 mt-6">
      {!hideCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      <Button 
        type="button" 
        onClick={onSubmit}
        className="bg-form-300 hover:bg-form-400 text-white"
      >
        {submitText}
      </Button>
    </div>
  );
};

export default FormActions;
