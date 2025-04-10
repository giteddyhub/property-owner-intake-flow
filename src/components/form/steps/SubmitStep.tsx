
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/contexts/FormContext';
import { CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SubmitStep: React.FC = () => {
  const { state } = useFormContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Here you could add additional logic for final submission, 
      // like sending an email notification or generating a PDF
      
      // Simulate a delay for submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "Your property owner intake form has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNew = () => {
    navigate(0); // Refresh the page to start a new form
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Submission Complete!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for completing the property owner intake form. Your information has been successfully submitted.
        </p>
        <Button onClick={startNew} className="bg-form-300 hover:bg-form-400 text-white">
          Start New Form
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Submit Your Information</h2>
      
      <div className="bg-form-100 p-6 rounded-lg mb-8">
        <h3 className="font-medium mb-4">Summary</h3>
        <div className="space-y-3">
          <p><span className="font-medium">Owners:</span> {state.owners.length}</p>
          <p><span className="font-medium">Properties:</span> {state.properties.length}</p>
          <p><span className="font-medium">Assignments:</span> {state.assignments.length}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="font-medium mb-4">Before You Submit</h3>
        <p className="text-gray-600">
          Please review all the information you've provided in the previous steps to ensure accuracy. 
          Once submitted, your data will be saved and processed.
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-form-300 hover:bg-form-400 text-white px-8 py-2 h-12 text-base"
        >
          {isSubmitting ? 'Submitting...' : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubmitStep;
