
import { useState } from 'react';
import { showSuccessToast, showErrorToast, showLoadingToast } from '../SuccessToast';

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

  const handleSubmit = async (submitFn: () => Promise<void>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const toastId = showLoadingToast(loadingMessage);
    
    try {
      await submitFn();
      showSuccessToast({ title: successMessage });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      showErrorToast(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
      // Dismiss loading toast
      if (toastId) {
        setTimeout(() => {
          // Toast will auto-dismiss when success/error shows
        }, 100);
      }
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
