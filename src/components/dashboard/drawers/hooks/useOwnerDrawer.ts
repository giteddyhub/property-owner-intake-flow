
import { useState, useEffect } from 'react';
import { Owner } from '@/components/dashboard/types';
import { createEmptyOwner } from '@/components/form/owner/utils';
import { useOwnerDrawerSubmit } from './useOwnerDrawerSubmit';
import { useOwnerFieldHandlers } from './useOwnerFieldHandlers';
import { useOwnerDrawerCleanup } from './useOwnerDrawerCleanup';

interface UseOwnerDrawerProps {
  owner?: Owner;
  onClose: () => void;
  onSuccess: () => void;
}

export const useOwnerDrawer = ({ owner, onClose, onSuccess }: UseOwnerDrawerProps) => {
  const [showResidencyDialog, setShowResidencyDialog] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner>(owner || createEmptyOwner());
  
  // Import handler modules - hooks called at top level
  const { handleSubmit: submitOwner, isSubmitting } = useOwnerDrawerSubmit();
  const { handleClose: cleanupDrawer } = useOwnerDrawerCleanup();
  const { 
    handleOwnerChange,
    handleInputChange,
    handleDateChange,
    handleCountryChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange
  } = useOwnerFieldHandlers({ setCurrentOwner });
  
  // Handle state changes for US addresses
  const handleStateChange = (state: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state
      }
    }));
  };
  
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
    
    try {
      await submitOwner({
        owner,
        currentOwner,
        onSuccess,
        onClose: handleClose
      });
    } catch (error) {
      console.error('Error submitting owner:', error);
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
    handleStateChange,
    handleClose
  };
};
