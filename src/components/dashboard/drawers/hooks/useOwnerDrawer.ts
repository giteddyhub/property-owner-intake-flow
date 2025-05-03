
import { useState, useEffect } from 'react';
import { Owner } from '@/components/dashboard/types';
import { createEmptyOwner } from '@/components/form/owner/utils';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useOwnerDrawerSubmit } from './useOwnerDrawerSubmit';
import { useOwnerFieldHandlers } from './useOwnerFieldHandlers';
import { useOwnerDrawerCleanup } from './useOwnerDrawerCleanup';

interface UseOwnerDrawerProps {
  owner?: Owner;
  onClose: () => void;
  onSuccess: () => void;
}

export const useOwnerDrawer = ({ owner, onClose, onSuccess }: UseOwnerDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResidencyDialog, setShowResidencyDialog] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner>(owner || createEmptyOwner());
  const { user } = useAuth();
  
  // Import handler modules
  const { handleSubmit: submitOwner } = useOwnerDrawerSubmit();
  const { handleClose: cleanupDrawer } = useOwnerDrawerCleanup();
  const { 
    handleOwnerChange,
    handleInputChange,
    handleDateChange,
    handleCountryChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange
  } = useOwnerFieldHandlers({ setCurrentOwner });
  
  // Reset currentOwner when owner prop changes
  useEffect(() => {
    setCurrentOwner(owner || createEmptyOwner());
  }, [owner]);
  
  // Ensure clean up on unmount or when drawer closes
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
    };
  }, []);
  
  const handleSubmit = async () => {
    if (showResidencyDialog) {
      return; // Don't proceed if residency dialog needs to be shown
    }
    
    setIsSubmitting(true);
    
    try {
      await submitOwner({
        owner,
        currentOwner,
        userId: user?.id,
        onSuccess,
        onClose: handleClose
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clean close to ensure no stray elements block interaction
  const handleClose = () => {
    cleanupDrawer();
    onClose();
  };

  return {
    isSubmitting,
    currentOwner,
    showResidencyDialog,
    setShowResidencyDialog,
    handleSubmit,
    handleOwnerChange,
    handleInputChange,
    handleDateChange,
    handleCountryChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleClose
  };
};
