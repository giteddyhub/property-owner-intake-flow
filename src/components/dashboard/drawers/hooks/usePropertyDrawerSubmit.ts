
import { Property } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDrawerSubmit } from './useDrawerSubmit';

interface UsePropertyDrawerSubmitProps {
  property?: Property;
  onSuccess: () => void;
  onClose: () => void;
}

export const usePropertyDrawerSubmit = () => {
  const { createProperty, updateProperty } = useDashboardData();

  const handleSubmit = async (
    { property, onSuccess, onClose }: UsePropertyDrawerSubmitProps,
    newProperty: Property,
    occupancyMonths: Record<string, number>
  ) => {
    const isEditing = !!property?.id;
    const successMessage = isEditing ? 'Property updated successfully' : 'Property added successfully';
    const loadingMessage = isEditing ? 'Updating property...' : 'Adding property...';

    const { handleSubmit: submitWithFeedback } = useDrawerSubmit({
      onSuccess,
      onClose,
      successMessage,
      loadingMessage
    });

    await submitWithFeedback(async () => {
      if (isEditing) {
        const { id, ...updateData } = newProperty;
        await updateProperty(property.id, updateData);
      } else {
        await createProperty(newProperty);
      }
    });
  };

  return { handleSubmit };
};
