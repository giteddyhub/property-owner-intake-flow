
import { Property } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface UsePropertyDrawerSubmitProps {
  property?: Property;
  newProperty: Property;
  occupancyMonths: Record<string, number>;
  onSuccess: () => void;
  onClose: () => void;
}

export const usePropertyDrawerSubmit = () => {
  const { createProperty, updateProperty } = useDashboardData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({
    property,
    newProperty,
    occupancyMonths,
    onSuccess,
    onClose
  }: UsePropertyDrawerSubmitProps) => {
    if (isSubmitting) {
      console.log('[usePropertyDrawerSubmit] Already submitting, ignoring duplicate submission');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to save properties');
      return;
    }

    setIsSubmitting(true);
    console.log('[usePropertyDrawerSubmit] Starting submission:', { 
      isEditing: !!property?.id, 
      userId: user.id,
      propertyLabel: newProperty.label
    });

    const isEditing = !!property?.id;
    const loadingMessage = isEditing ? 'Updating property...' : 'Adding property...';
    const successMessage = isEditing ? 'Property updated successfully' : 'Property added successfully';

    // Show loading toast
    const loadingToast = toast.loading(loadingMessage);

    try {
      let result;
      
      if (isEditing) {
        const { id, ...updateData } = newProperty;
        result = await updateProperty(property.id, updateData);
      } else {
        result = await createProperty(newProperty);
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result) {
        console.log('[usePropertyDrawerSubmit] Submission successful');
        toast.success(successMessage);
        onSuccess();
        onClose();
      } else {
        console.error('[usePropertyDrawerSubmit] Submission failed - no result returned');
        toast.error('Operation failed. Please check the form and try again.');
      }
    } catch (error: any) {
      console.error('[usePropertyDrawerSubmit] Submission error:', error);
      toast.dismiss(loadingToast);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error('Operation failed', {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
      console.log('[usePropertyDrawerSubmit] Submission completed');
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
