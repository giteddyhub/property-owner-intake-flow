
import React, { useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Owner } from '@/components/dashboard/types';
import { useOwnerDrawer } from './hooks/useOwnerDrawer';
import OwnerDrawerContent from './components/OwnerDrawerContent';

interface OwnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  owner?: Owner;
  onSuccess: () => void;
}

const OwnerDrawer: React.FC<OwnerDrawerProps> = ({ 
  isOpen, 
  onClose, 
  owner,
  onSuccess
}) => {
  // Ensure cleanup when the component unmounts or when isOpen changes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      if (!isOpen) {
        document.body.style.pointerEvents = '';
        
        // Clean up any stray overlay elements
        const overlays = document.querySelectorAll('[data-state="closed"][data-radix-portal], .vaul-overlay[data-state="closed"]');
        overlays.forEach(overlay => {
          if (overlay.parentNode) {
            console.log('Cleaning up overlay on unmount:', overlay);
            overlay.parentNode.removeChild(overlay);
          }
        });
      }
    };
  }, [isOpen]);
  
  const {
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
    handleClose: originalHandleClose
  } = useOwnerDrawer({
    owner,
    onClose,
    onSuccess
  });
  
  // Enhanced close handler with more thorough cleanup
  const handleClose = () => {
    // Force reset document pointerEvents
    document.body.style.pointerEvents = '';
    
    // Clean up any lingering overlay elements
    const cleanupOverlays = () => {
      const selectors = [
        '[data-state="closed"][data-radix-portal]',
        '.vaul-overlay[data-state="closed"]',
        '[role="dialog"][aria-hidden="true"]',
        '.fixed.inset-0.z-50:not([data-state="open"])'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (element.parentNode) {
            console.log('Removing lingering element:', element);
            element.parentNode.removeChild(element);
          }
        });
      });
      
      // Reset body styles
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
    
    // Execute cleanup immediately and after animation completes
    cleanupOverlays();
    setTimeout(cleanupOverlays, 500);
    
    // Call the original handler
    originalHandleClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0">
        <OwnerDrawerContent
          owner={owner}
          currentOwner={currentOwner}
          onSubmit={handleSubmit}
          onClose={handleClose}
          onOwnerChange={handleOwnerChange}
          onCountryChange={handleCountryChange}
          onDateChange={handleDateChange}
          onInputChange={handleInputChange}
          onResidencyStatusChange={handleResidencyStatusChange}
          onResidencyDetailChange={handleResidencyDetailChange}
          onStateChange={handleStateChange}
          showResidencyDialog={showResidencyDialog}
          setShowResidencyDialog={setShowResidencyDialog}
        />
      </SheetContent>
    </Sheet>
  );
};

export default OwnerDrawer;
