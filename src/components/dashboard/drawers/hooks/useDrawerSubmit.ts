
import { useState } from 'react';
import { toast } from 'sonner';

interface UseDrawerSubmitProps {
  onSuccess: () => void;
  onClose: () => void;
  successMessage: string;
  loadingMessage: string;
}

export const useDrawerSubmit = ({
  onSuccess,
  onClose,
  successMessage,
  loadingMessage
}: UseDrawerSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (submitFunction: () => Promise<any>) => {
    if (isSubmitting) {
      console.log('[useDrawerSubmit] Already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);
    console.log('[useDrawerSubmit] Starting submission:', { loadingMessage });

    try {
      // Show loading toast
      const loadingToast = toast.loading(loadingMessage);

      const result = await submitFunction();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result) {
        console.log('[useDrawerSubmit] Submission successful');
        toast.success(successMessage);
        onSuccess();
        onClose();
      } else {
        console.error('[useDrawerSubmit] Submission failed - no result returned');
        toast.error('Operation failed. Please check the form and try again.');
      }
    } catch (error: any) {
      console.error('[useDrawerSubmit] Submission error:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error('Operation failed', {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
      console.log('[useDrawerSubmit] Submission completed');
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
