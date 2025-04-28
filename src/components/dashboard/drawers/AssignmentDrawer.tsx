
import React from 'react';
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
}

const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({ 
  isOpen, 
  onClose, 
  assignment,
  properties,
  owners,
  onSuccess
}) => {
  // Custom close handler to ensure cleanup
  const handleClose = () => {
    // Clean up any potential lingering elements
    document.body.style.pointerEvents = '';
    
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
        />
      </SheetContent>
    </Sheet>
  );
};

export default AssignmentDrawer;
