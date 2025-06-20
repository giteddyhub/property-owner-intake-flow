
import { useState, useEffect } from 'react';
import { Property } from '@/components/dashboard/types';
import { usePropertyDrawerSubmit } from './usePropertyDrawerSubmit';

interface UsePropertyDrawerProps {
  property?: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const usePropertyDrawer = ({ 
  property, 
  onClose, 
  onSuccess 
}: UsePropertyDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit: submitProperty } = usePropertyDrawerSubmit();
  
  // Ensure clean up on unmount or when drawer closes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      document.body.style.pointerEvents = '';
    };
  }, []);

  const handleSubmit = async (newProperty: Property, occupancyMonths: Record<string, number>) => {
    setIsSubmitting(true);
    
    try {
      await submitProperty(
        { property, onSuccess, onClose: handleClose },
        newProperty,
        occupancyMonths
      );
    } catch (error) {
      console.error('Error submitting property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle clean close to ensure no stray elements block interaction
  const handleClose = () => {
    // Remove any pointer-events blocking that might have been applied
    document.body.style.pointerEvents = '';
    // Remove any lingering overlay elements
    const overlays = document.querySelectorAll('[data-state="open"][data-radix-portal]');
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    onClose();
  };

  return {
    isSubmitting,
    handleSubmit,
    handleClose
  };
};
