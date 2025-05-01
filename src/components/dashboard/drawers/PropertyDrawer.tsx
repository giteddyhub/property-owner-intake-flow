
import React, { useEffect } from 'react';
import { 
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Property } from '@/components/dashboard/types';
import { usePropertyDrawer } from './hooks/usePropertyDrawer';
import PropertyDrawerContent from './components/PropertyDrawerContent';

interface PropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  onSuccess: () => void;
}

const PropertyDrawer: React.FC<PropertyDrawerProps> = ({ 
  isOpen, 
  onClose, 
  property,
  onSuccess
}) => {
  // Enhanced cleanup function
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
          console.log('Cleaning up overlay element:', element);
          element.parentNode.removeChild(element);
        }
      });
    });
    
    // Reset body styles
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
  };

  // Ensure cleanup when the component unmounts or when isOpen changes
  useEffect(() => {
    // Initial cleanup when the drawer opens
    if (isOpen) {
      setTimeout(cleanupOverlays, 100);
    }
    
    return () => {
      // This will run when the component unmounts or when isOpen changes to false
      if (!isOpen) {
        setTimeout(cleanupOverlays, 100);
        setTimeout(cleanupOverlays, 500); // Extra cleanup after animation
      }
    };
  }, [isOpen]);
  
  const {
    handleSubmit,
    handleClose: originalHandleClose
  } = usePropertyDrawer({
    property,
    onClose,
    onSuccess
  });
  
  // Enhanced close handler with more thorough cleanup
  const handleClose = () => {
    // Force reset document pointerEvents
    document.body.style.pointerEvents = '';
    
    // Execute cleanup immediately and after animation completes
    cleanupOverlays();
    setTimeout(cleanupOverlays, 500);
    
    // Call the original handler
    originalHandleClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0">
        <PropertyDrawerContent
          property={property}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
};

export default PropertyDrawer;
