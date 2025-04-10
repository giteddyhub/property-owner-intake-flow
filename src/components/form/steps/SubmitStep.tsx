
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import FormNavigation from '@/components/form/FormNavigation';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const SubmitStep: React.FC = () => {
  const { state, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  
  const handleSubmit = () => {
    toast.success('Form submitted successfully!', {
      description: 'Thank you for completing the property owner intake process.',
      duration: 5000,
    });
    
    setTimeout(() => {
      toast("Your submission has been received", {
        description: "A confirmation email has been sent with a summary of your submission.",
        action: {
          label: "Download Summary",
          onClick: () => handleDownloadSummary(),
        },
      });
    }, 1000);
  };
  
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
    
    toast.success('Summary downloaded successfully');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Submit Your Information</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-3">Ready for Submission</h3>
        <p className="text-green-700 mb-4">
          You have completed all required information for your property owner tax declaration.
          Upon submission, your data will be processed for tax assessment purposes.
        </p>
        <p className="text-green-700 mb-2">
          A confirmation email will be sent to you with a summary of your submitted information.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mb-8">
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Owners</h4>
            <p className="text-3xl font-bold text-form-400">{owners.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Properties</h4>
            <p className="text-3xl font-bold text-form-400">{properties.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Assignments</h4>
            <p className="text-3xl font-bold text-form-400">{assignments.length}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => prevStep()}
          className="w-full md:w-auto"
        >
          Back to Review
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
            onClick={handleSubmit}
            className="bg-form-300 hover:bg-form-400 text-white w-full sm:w-auto"
          >
            Submit Information
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitStep;
