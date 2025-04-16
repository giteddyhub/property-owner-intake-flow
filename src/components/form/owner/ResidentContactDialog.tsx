
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResidentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
}

const ResidentContactDialog: React.FC<ResidentContactDialogProps> = ({
  open,
  onOpenChange,
  onStatusChange
}) => {
  // When dialog is closed without clicking a button, we'll detect
  // this in the onOpenChange handler in the parent component
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Important Notice for Italian Residents</DialogTitle>
          <DialogDescription className="pt-4">
            If you are a registered resident in Italy, you need to complete a different form.
            We'll redirect you to our specialized service for Italian residents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Our regular service is designed for non-residents who own property in Italy.
            Residents have different tax obligations and filing requirements.
          </p>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end mt-2">
            <Button 
              type="button"
              variant="default"
              className="bg-form-400 hover:bg-form-500"
              onClick={onStatusChange}
            >
              I understand, change my status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentContactDialog;
