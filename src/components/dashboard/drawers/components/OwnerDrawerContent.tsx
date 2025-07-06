
import React from 'react';
import { 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import OwnerForm from '@/components/form/owner/OwnerForm';
import { Owner } from '@/components/dashboard/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OwnerDrawerContentProps {
  owner?: Owner;
  currentOwner: Owner;
  onSubmit: () => void;
  onClose: () => void;
  onOwnerChange: (field: string, value: any) => void;
  onCountryChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResidencyStatusChange: (value: string) => void;
  onResidencyDetailChange: (field: string, value: string) => void;
  onStateChange: (state: string) => void;
  showResidencyDialog: boolean;
  setShowResidencyDialog: (show: boolean) => void;
}

const OwnerDrawerContent: React.FC<OwnerDrawerContentProps> = ({ 
  owner,
  currentOwner,
  onSubmit,
  onClose,
  onOwnerChange,
  onCountryChange,
  onDateChange,
  onInputChange,
  onResidencyStatusChange,
  onResidencyDetailChange,
  onStateChange,
  showResidencyDialog,
  setShowResidencyDialog
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <SheetHeader className="relative">
          <div>
            <SheetTitle>{owner ? 'Edit Owner' : 'Add New Owner'}</SheetTitle>
            <SheetDescription>
              {owner 
                ? 'Update the owner details below'
                : 'Fill in the details to add a new owner'
              }
            </SheetDescription>
          </div>
        </SheetHeader>
        
        <div className="mt-6">
          <OwnerForm
            owner={currentOwner}
            editingIndex={owner ? 0 : null}
            onSubmit={onSubmit}
            onCancel={onClose}
            onOwnerChange={onOwnerChange}
            onCountryChange={onCountryChange}
            onDateChange={onDateChange}
            onInputChange={onInputChange}
            onResidencyStatusChange={onResidencyStatusChange}
            onResidencyDetailChange={onResidencyDetailChange}
            onStateChange={onStateChange}
            showResidencyDialog={showResidencyDialog}
            setShowResidencyDialog={setShowResidencyDialog}
            hideCancel={true}
          />
        </div>

        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </div>
    </ScrollArea>
  );
};

export default OwnerDrawerContent;
