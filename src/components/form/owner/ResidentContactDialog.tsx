
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useResidentContactForm } from '@/hooks/useResidentContactForm';
import { ResidentContactForm } from './contact/ResidentContactForm';
import { ResidentContactSuccess } from './contact/ResidentContactSuccess';
import { ResidentDialogHeader } from './contact/ResidentDialogHeader';
import { ItalianResidenceDetails } from '@/types/form';

interface ResidentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
  italianResidenceDetails?: ItalianResidenceDetails;
  onResidencyDetailChange?: (field: string, value: string) => void;
}

const ResidentContactDialog: React.FC<ResidentContactDialogProps> = ({
  open,
  onOpenChange,
  onStatusChange,
  italianResidenceDetails = {},
  onResidencyDetailChange,
}) => {
  const {
    contact,
    isSubmitting,
    isContactSubmitted,
    handleContactChange,
    saveResidentContact
  } = useResidentContactForm();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <ResidentDialogHeader />
        <div className="mt-4 flex flex-col space-y-4">
          {!isContactSubmitted ? (
            <ResidentContactForm
              contact={contact}
              isSubmitting={isSubmitting}
              onContactChange={handleContactChange}
              onStatusChange={onStatusChange}
              onSubmit={saveResidentContact}
            />
          ) : (
            <ResidentContactSuccess />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentContactDialog;
