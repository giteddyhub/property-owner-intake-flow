
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const ResidentDialogHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle>Important Notice for Italian Tax Residents</DialogTitle>
      <DialogDescription className="pt-4">
        If you are a registered tax resident in Italy, you need to complete a different form.
        We'll contact you with information about our specialized service for Italian tax residents.
      </DialogDescription>
    </DialogHeader>
  );
};
