
import { Owner } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface UseOwnerDrawerSubmitProps {
  owner?: Owner;
  currentOwner: Owner;
  onSuccess: () => void;
  onClose: () => void;
}

export const useOwnerDrawerSubmit = () => {
  const { createOwner, updateOwner } = useDashboardData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({ 
    owner, 
    currentOwner, 
    onSuccess, 
    onClose 
  }: UseOwnerDrawerSubmitProps) => {
    if (isSubmitting) {
      console.log('[useOwnerDrawerSubmit] Already submitting, ignoring duplicate submission');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to save owners');
      return;
    }

    setIsSubmitting(true);
    console.log('[useOwnerDrawerSubmit] Starting submission:', { 
      isEditing: !!owner?.id, 
      userId: user.id,
      ownerName: `${currentOwner.firstName} ${currentOwner.lastName}`
    });

    const isEditing = !!owner?.id;
    const loadingMessage = isEditing ? 'Updating owner...' : 'Adding owner...';
    const successMessage = isEditing ? 'Owner updated successfully' : 'Owner added successfully';

    // Show loading toast
    const loadingToast = toast.loading(loadingMessage);

    try {
      let result;
      
      if (isEditing) {
        const { id, ...updateData } = currentOwner;
        result = await updateOwner(owner.id, updateData);
      } else {
        result = await createOwner(currentOwner);
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result) {
        console.log('[useOwnerDrawerSubmit] Submission successful');
        toast.success(successMessage);
        onSuccess();
        onClose();
      } else {
        console.error('[useOwnerDrawerSubmit] Submission failed - no result returned');
        toast.error('Operation failed. Please check the form and try again.');
      }
    } catch (error: any) {
      console.error('[useOwnerDrawerSubmit] Submission error:', error);
      toast.dismiss(loadingToast);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error('Operation failed', {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
      console.log('[useOwnerDrawerSubmit] Submission completed');
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
