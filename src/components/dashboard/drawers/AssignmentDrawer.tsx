
import React, { useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import AssignmentDrawerContent from './assignment/AssignmentDrawerContent';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: OwnerPropertyAssignment;
  properties: Property[];
  owners: Owner[];
  onSuccess: () => void;
  userId: string; // Added userId prop
}

const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({ 
  isOpen, 
  onClose, 
  assignment,
  properties,
  owners,
  onSuccess,
  userId // Accept userId prop
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

  // Custom close handler to ensure cleanup
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
    
    // Call the original onClose function
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0">
        <AssignmentDrawerContent
          assignment={assignment}
          properties={properties}
          owners={owners}
          onClose={handleClose}
          onSuccess={onSuccess}
          userId={userId} // Pass userId
        />
      </SheetContent>
    </Sheet>
  );
};

export default AssignmentDrawer;
