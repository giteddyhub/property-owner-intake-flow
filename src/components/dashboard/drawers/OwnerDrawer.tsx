
import React from 'react';
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
    handleClose
  } = useOwnerDrawer({
    owner,
    onClose,
    onSuccess
  });
  
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
          showResidencyDialog={showResidencyDialog}
          setShowResidencyDialog={setShowResidencyDialog}
        />
      </SheetContent>
    </Sheet>
  );
};

export default OwnerDrawer;
