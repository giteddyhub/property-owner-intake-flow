import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { toast } from '@/components/ui/use-toast';

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
  const handleDownloadSummary = () => {
    
    const formData = {
      owners,
      properties,
      assignments,
      submittedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(formData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'property-owner-submission.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    
    toast({
      title: "Success",
      description: "Summary downloaded successfully",
      type: "success"
    });
  };

  
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
      <Button 
        variant="outline" 
        onClick={prevStep}
        className="w-full sm:w-auto"
      >
        Back
      </Button>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={handleDownloadSummary}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Download Summary
        </Button>
        <Button 
          onClick={onSubmitButtonClick}
          disabled={isSubmitting}
          className="bg-form-300 hover:bg-form-400 text-white w-full sm:w-auto"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewActions;
