
import { Owner } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDrawerSubmit } from './useDrawerSubmit';

interface UseOwnerDrawerSubmitProps {
  owner?: Owner;
  currentOwner: Owner;
  userId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useOwnerDrawerSubmit = () => {
  const { createOwner, updateOwner } = useDashboardData();

  const handleSubmit = async ({ 
    owner, 
    currentOwner, 
    userId, 
    onSuccess, 
    onClose 
  }: UseOwnerDrawerSubmitProps) => {
    if (!userId) {
      throw new Error('You must be logged in to save owners');
    }

    const isEditing = !!owner?.id;
    const successMessage = isEditing ? 'Owner updated successfully' : 'Owner added successfully';
    const loadingMessage = isEditing ? 'Updating owner...' : 'Adding owner...';

    const { handleSubmit: submitWithFeedback } = useDrawerSubmit({
      onSuccess,
      onClose,
      successMessage,
      loadingMessage
    });

    await submitWithFeedback(async () => {
      if (isEditing) {
        const { id, ...updateData } = currentOwner;
        await updateOwner(owner.id, updateData);
      } else {
        await createOwner(currentOwner);
      }
    });
  };

  return { handleSubmit };
};
