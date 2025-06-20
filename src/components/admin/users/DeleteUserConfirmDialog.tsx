
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { UserDataSummary } from '@/hooks/admin/useAdvancedUserManagement';
import { UserInfoCard } from './delete-dialog/UserInfoCard';
import { DataSummaryCard } from './delete-dialog/DataSummaryCard';
import { CriticalWarningCard } from './delete-dialog/CriticalWarningCard';
import { DeletionFormFields } from './delete-dialog/DeletionFormFields';

interface DeleteUserConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName?: string;
  dataSummary?: UserDataSummary;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

export const DeleteUserConfirmDialog: React.FC<DeleteUserConfirmDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
  dataSummary,
  onConfirm,
  loading
}) => {
  const [reason, setReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);

  const isFormValid = reason.trim().length >= 10 && 
                     confirmEmail === userEmail && 
                     confirmDeletion && 
                     confirmUnderstanding;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmEmail('');
      setConfirmDeletion(false);
      setConfirmUnderstanding(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (isFormValid) {
      onConfirm(reason.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User Account - CRITICAL ACTION
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete the user account and ALL associated data. 
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <UserInfoCard
            userId={userId}
            userEmail={userEmail}
            userName={userName}
            accountAgeDays={dataSummary?.account_age_days}
          />

          {dataSummary && <DataSummaryCard dataSummary={dataSummary} />}

          <CriticalWarningCard />

          <DeletionFormFields
            reason={reason}
            setReason={setReason}
            confirmEmail={confirmEmail}
            setConfirmEmail={setConfirmEmail}
            userEmail={userEmail}
            confirmDeletion={confirmDeletion}
            setConfirmDeletion={setConfirmDeletion}
            confirmUnderstanding={confirmUnderstanding}
            setConfirmUnderstanding={setConfirmUnderstanding}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !isFormValid}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'DELETE ACCOUNT PERMANENTLY'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
